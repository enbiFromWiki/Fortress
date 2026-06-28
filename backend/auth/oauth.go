package auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"gateway/backend/mediawiki"
	"net/http"

	// "net/url"
	"os"
	// "strings"
	"time"

	"crypto/rand"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
)

type AuthService struct {
	Config *oauth2.Config
	Client *http.Client
	Ctx    context.Context
	MWApi  *mediawiki.MediaWikiClient
}

func New(mwClient *mediawiki.MediaWikiClient) *AuthService {
	err := godotenv.Load("./backend/.env")
	if err != nil {
		panic("no .env found.")
	}

	client := &http.Client{
		Transport: &uaTransport{
			base: http.DefaultTransport,
			ua:   "User:enbi/OAuth Testing (localhost dev)",
		},
	}

	config := &oauth2.Config{
		ClientID:     os.Getenv("CLIENT_ID"),
		ClientSecret: os.Getenv("CLIENT_SECRET"),
		RedirectURL:  "http://localhost:8080/auth/callback",
		Scopes: []string{
			"basic",
			"editpage",
			"rollback",
		},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://meta.wikimedia.org/w/rest.php/oauth2/authorize",
			TokenURL: "https://meta.wikimedia.org/w/rest.php/oauth2/access_token",
		},
	}

	return &AuthService{
		Config: config,
		Client: client,
		Ctx:    context.WithValue(context.Background(), oauth2.HTTPClient, client),
		MWApi:  mwClient,
	}
}

type AuthJSONToken struct {
	Username     string
	AccessToken  string
	RefreshToken string
	Expiry       time.Time
}

type CSRF struct {
	Query struct {
		Tokens struct {
			Csrftoken string `json:"csrftoken"`
		} `json:"tokens"`
	} `json:"query"`
}

type Session struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	Expiry       time.Time `json:"expiry"`
}

func (a *AuthService) generateRandomCode() (string, error) {
	b := make([]byte, 32)
	rand.Read(b)

	output := base64.URLEncoding.WithPadding(base64.NoPadding).EncodeToString(b)

	return output, nil
}

func (a *AuthService) Login(c *gin.Context) {
	state, err := a.generateRandomCode()
	if err != nil {
		c.String(http.StatusInternalServerError, "Error generating random string: %t", err)
		return
	}

	url := a.Config.AuthCodeURL(state) + "&oauth_version=2"
	c.Redirect(302, url)
}

func (a *AuthService) getToken(code string) (*AuthJSONToken, error) {
	token, err := a.Config.Exchange(a.Ctx, code)

	if err != nil {
		return nil, err
	}

	data, err := a.MWApi.Get(map[string]string{
		"action": "query",
		"meta":   "userinfo",
	}, token.AccessToken)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	var realData map[string]any

	_ = json.Unmarshal(data, &realData)

	query, ok := realData["query"].(map[string]any)
	if !ok {
		fmt.Println(string(data))
		return nil, errors.New("Unexpected MediaWiki API response")
	}
	userinfo, ok := query["userinfo"].(map[string]any)
	if !ok {
		return nil, errors.New("Unexpected MediaWiki API response")
	}
	name, ok := userinfo["name"]
	if !ok {
		return nil, errors.New("Unexpected MediaWiki API response")
	}
	nameStr, ok := name.(string)
	if !ok {
		return nil, errors.New("Non-string username.")
	}

	authToken := AuthJSONToken{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		Expiry:       token.Expiry,
		Username:     nameStr,
	}

	return &authToken, nil
}

func (a *AuthService) Callback(c *gin.Context) {
	code := c.Query("code")

	if code == "" {
		c.String(400, "No oauth2 code returned")
		return
	}

	token, err := a.getToken(code)

	if err != nil {
		c.String(500, "Token exchange failed: %t", err.Error())
		return
	}

	data, _ := json.Marshal(token)

	c.SetCookie("oauth_tokens", string(data), 14*24*60*60, "/", "", true, true)
	c.Redirect(302, "http://localhost:5173")
}

type uaTransport struct {
	base http.RoundTripper
	ua   string
}

func (t *uaTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("User-Agent", t.ua)
	return t.base.RoundTrip(req)
}
