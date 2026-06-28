package main

import (
	// "gateway/backend/eventstream"
	"gateway/backend/eventstream"
	//"gateway/backend/mediawiki"
	// "gateway/backend/auth"
	// "gateway/backend/middleware"
	// "gateway/backend/wshandler"
	// "github.com/gin-gonic/gin"
)

// "gateway/backend/api"

func main() {
	// server := api.NewServer()
	// server.Start()
	//mwclient := mediawiki.New("Overseer anti-vandalism application OAuth2 testing/0.2.0 (User:enbi@enwiki; lawfulbaguette@gmail.com)", "https://test.wikipedia.org")
	esclient := eventstream.New()
	esclient.StartStream()

	// authService := auth.New(mwclient)
	// middlew := middleware.Auth(authService)

	// hub := wshandler.New()

	// go hub.Run()

	// r := gin.Default()

	// r.Use(middlew)

	// r.GET("/ws", func(c *gin.Context) {
	// 	wshandler.ServeWs(hub, c)
	// })

	// r.Run("127.0.0.1:8080")
}
