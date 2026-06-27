package middleware

import (
	"encoding/json"
	"fmt"
	"gateway/backend/auth"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

func Auth(a *auth.AuthService) func(c *gin.Context) {
	return func(c *gin.Context) {

		cookie, err := c.Cookie("oauth_tokens")

		if err != nil {
			c.JSON(401, gin.H{
				"status": "error",
				"error":  "no oauth2 tokens found",
			})
			return
		}

		jwt := &auth.AuthJSONToken{}

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

		ts := a.Config.TokenSource(a.Ctx, tok)

		token, err := ts.Token()
		if err != nil {
			c.JSON(401, gin.H{
				"status": "reauth",
				"error":  fmt.Sprint(err),
			})
			return
		}

		newCookie := &auth.AuthJSONToken{
			Username:     jwt.Username,
			AccessToken:  token.AccessToken,
			RefreshToken: token.RefreshToken,
			Expiry:       token.Expiry,
		}

		cookieData, _ := json.Marshal(newCookie)

		c.SetCookie("oauth_tokens", string(cookieData), 14*24*60*60, "/", "", true, true)
		c.Set("accessToken", token.AccessToken)
		c.Next()
	}
}
