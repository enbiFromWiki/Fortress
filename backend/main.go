package main

import (
	// "gateway/backend/app"
	"gateway/backend/auth"

	"github.com/gin-gonic/gin"
)

func main() {
	// app.Run()
	auth.InitAuth()
	r := gin.Default()

	r.Static("/assets", "./frontend/dist/assets")

	r.GET("/", func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	r.GET("/login", auth.Login)
	r.GET("/auth/callback", auth.Callback)
	r.GET("/call", auth.ApiTest)
	r.GET("/call2", auth.ApiTest2)

	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	r.Run("127.0.0.1:8080")
}
