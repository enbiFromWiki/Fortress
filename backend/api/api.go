package api

//import "github.com/gin-gonic/gin"

// func GetEditCounts(c *gin.Context) {

// }

import (
	"gateway/backend/util"

	"github.com/gin-gonic/gin"
)

type RollbackRequest struct {
	Page   string `json:"page" binding:"required"`
	User   string `json:"user" binding:"required"`
	Server string `json:"server" binding:"required"`
	//Summary string `json:"summary"`
}

func Rollback(c *gin.Context) {
	var postBody RollbackRequest

	if err := c.ShouldBindJSON(&postBody); err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Failed to unmarshal POST body",
		})
		return
	}
}

func GetEditCounts(c *gin.Context) {
	token, ok := c.Get("accessToken")
	if !ok {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Middleware auth failure",
		})
	}

	wiki := c.Query("w")
	if wiki == "" {
		c.JSON(400, gin.H{
			"status": "error",
			"error":  "Missing required param: 'w'",
		})
	}

	wikiApi := wiki + "/w/api.php"

	res, err := util.DefaultClient.Get(map[string]string{
		"action":  "query",
		"list":    "users",
		"usprop":  "editcount",
		"ususers": c.Param("users"),
	}, token.(string), wikiApi)
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "failed to get users",
		})
	}
	c.String(200, string(res))
}
