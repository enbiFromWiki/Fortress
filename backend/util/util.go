package util

import "github.com/gin-gonic/gin"

func ReturnError(c *gin.Context, code int, message string) {
	c.JSON(500, gin.H{
		"status": "error",
		"error":  message,
	})
}
