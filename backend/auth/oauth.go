package auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"gateway/backend/util"
	"io"
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

var httpc = &http.Client{
	Transport: &uaTransport{
		base: http.DefaultTransport,
		ua:   "User:enbi/OAuth Testing (localhost dev)",
	},
}

type JWT struct {
	Username     string
	AccessToken  string
	RefreshToken string
	Expiry       time.Time
}

var CTX = context.WithValue(context.Background(), oauth2.HTTPClient, httpc)

type MWOauth struct {
	config *oauth2.Config
	ua     string
}

var OAuthConfig *oauth2.Config
var authenticator *MWOauth

func InitAuth() {
	err := godotenv.Load("./backend/.env")
	if err != nil {
		panic("no .env found.")
	}
	OAuthConfig = &oauth2.Config{
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
	authenticator = &MWOauth{
		config: OAuthConfig,
		ua:     "User:enbi/OAuth Testing (localhost dev)",
	}
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

func generateRandomCode() (string, error) {
	b := make([]byte, 32)
	rand.Read(b)

	output := base64.URLEncoding.WithPadding(base64.NoPadding).EncodeToString(b)

	return output, nil
}

func Login(c *gin.Context) {
	state, err := generateRandomCode()
	if err != nil {
		c.String(http.StatusInternalServerError, "Error generating random string: %t", err)
		return
	}

	url := OAuthConfig.AuthCodeURL(state) + "&oauth_version=2"
	c.Redirect(302, url)
}

func (a *MWOauth) getToken(code string) (*JWT, error) {
	token, err := OAuthConfig.Exchange(CTX, code)
	client := util.DefaultClient

	data, err := client.Get(map[string]string{
		"action": "query",
		"meta":   "userinfo",
	}, token.AccessToken)

	var realData map[string]any

	_ = json.Unmarshal(data, &realData)

	if err != nil {
		return nil, err
	}

	query, ok := realData["query"].(map[string]any)
	if !ok {
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

	jwt := JWT{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		Expiry:       token.Expiry,
		Username:     nameStr,
	}

	return &jwt, nil
}

func Callback(c *gin.Context) {
	code := c.Query("code")

	if code == "" {
		c.String(400, "No oauth2 code returned")
		return
	}

	token, err := authenticator.getToken(code)

	if err != nil {
		c.String(500, "Token exchange failed: %t", err.Error())
		return
	}

	data, _ := json.Marshal(token)

	c.SetCookie("oauth_tokens", string(data), 14*24*60*60, "/", "", true, true)
	c.Redirect(302, "/main")
}

type uaTransport struct {
	base http.RoundTripper
	ua   string
}

func (t *uaTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("User-Agent", t.ua)
	return t.base.RoundTrip(req)
}

func ApiTest(c *gin.Context) {
	cookie, err := c.Cookie("oauth_tokens")

	if err != nil {
		c.JSON(401, gin.H{
			"status": "error",
			"error":  "no oauth2 tokens found",
		})
		return
	}

	jwt := &JWT{}

	err = json.Unmarshal([]byte(cookie), jwt)
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Failed to extract json cookies",
			"cookie": cookie,
		})
		return
	}

	tok := &oauth2.Token{
		AccessToken:  jwt.AccessToken,
		RefreshToken: jwt.RefreshToken,
		Expiry:       jwt.Expiry,
	}

	ts := OAuthConfig.TokenSource(CTX, tok)

	token, err := ts.Token()
	if err != nil {
		c.JSON(401, gin.H{
			"status": "reauth",
			"error":  fmt.Sprint(err),
		})
		return
	}

	cookieData := &JWT{
		AccessToken:  token.AccessToken,
		RefreshToken: tok.RefreshToken,
		Expiry:       token.Expiry,
		Username:     jwt.Username,
	}

	cookieBytes, err := json.Marshal(cookieData)
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Failed to marshal JSON cookie",
		})
	}

	c.SetCookie("oauth_tokens", string(cookieBytes), 14*24*60*60, "/", "", true, true)

	req, _ := http.NewRequest("GET", "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile", nil)

	req.Header.Set("User-Agent", authenticator.ua)
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to fetch userinfo",
		})
		return
	}
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	data := string(body)
	if res.StatusCode != 200 {
		c.JSON(res.StatusCode, gin.H{
			"status": "error",
			"error":  data,
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data":   data,
	})
}

func ApiTest2(c *gin.Context) {
	cookie, err := c.Cookie("oauth_tokens")

	if err != nil {
		c.JSON(401, gin.H{
			"status": "error",
			"error":  "no oauth2 tokens found",
		})
		return
	}

	jwt := &JWT{}

	err = json.Unmarshal([]byte(cookie), jwt)
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Failed to extract json cookies",
			"cookie": cookie,
		})
		return
	}

	tok := &oauth2.Token{
		AccessToken:  jwt.AccessToken,
		RefreshToken: jwt.RefreshToken,
		Expiry:       jwt.Expiry,
	}

	ts := OAuthConfig.TokenSource(CTX, tok)

	token, err := ts.Token()
	if err != nil {
		c.JSON(401, gin.H{
			"status": "reauth",
			"error":  fmt.Sprint(err),
		})
		return
	}

	newCookie := &JWT{
		Username:     jwt.Username,
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		Expiry:       token.Expiry,
	}

	cookieData, _ := json.Marshal(newCookie)

	c.SetCookie("oauth_tokens", string(cookieData), 14*24*60*60, "/", "", true, true)
	client := util.DefaultClient
	csrfTokenRes, err := client.Get(map[string]string{
		"action": "query",
		"meta":   "tokens",
	}, token.AccessToken)

	csrfStruct := &CSRF{}

	err = json.Unmarshal(csrfTokenRes, csrfStruct)
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Invalid token or bad mediawiki response",
		})
		return
	}

	csrfToken := csrfStruct.Query.Tokens.Csrftoken
	fmt.Println(string(csrfToken))

	data, err := client.Post(map[string]string{
		"action":     "edit",
		"title":      "Test2",
		"appendtext": "Test",
		"token":      csrfToken,
	}, token.AccessToken)

	if err != nil {
		c.JSON(500, gin.H{
			"status":  "erreur",
			"trueerr": err.Error(),
		})
		return
	}

	c.JSON(200, string(data))
}
