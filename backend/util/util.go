package util

import "github.com/gin-gonic/gin"

func ReturnError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{
		"status": "error",
		"error":  message,
	})
}

func Find[T any](sli []T, fn func(T) bool) (*T, bool) {

	for _, i := range sli {
		if fn(i) {
			return &i, true
		}
	}
	return nil, false
}
