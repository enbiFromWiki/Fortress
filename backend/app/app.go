package app

import (
	"encoding/json"
	"gateway/backend/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUsername(c *gin.Context) {
	cookie, err := c.Cookie("oauth_tokens")
	if err != nil {
		c.JSON(401, gin.H{
			"status": "error",
			"error":  "Not logged in",
		})
		return
	}
	session := &auth.AuthJSONToken{}

	err = json.Unmarshal([]byte(cookie), session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to parse JSON cookie",
		})
		return
	}

	name := session.Username
	c.String(200, name)
}
