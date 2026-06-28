package api

import (
	"gateway/backend/auth"
	"gateway/backend/eventstream"
	"gateway/backend/mediawiki"
	"gateway/backend/middleware"
	"gateway/backend/wshandler"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	Auth       *auth.AuthService
	MWClient   *mediawiki.MediaWikiClient
	ApiService *APIService
	WSHub      *wshandler.Hub
	SSEhandler *eventstream.WMStreamer
}

func NewServer() *Server {
	mwClient := mediawiki.New("Overseer anti-vandalism application OAuth2 testing/0.2.0 (User:enbi@enwiki; lawfulbaguette@gmail.com)", "https://test.wikipedia.org/w/api.php")
	authService := auth.New(mwClient)
	apiClient := NewAPI(mwClient)
	wsHub := wshandler.New()
	sseHandler := eventstream.New(wsHub)

	return &Server{
		MWClient:   mwClient,
		Auth:       authService,
		ApiService: apiClient,
		WSHub:      wsHub,
		SSEhandler: sseHandler,
	}
}

func (s *Server) Start() {
	go s.WSHub.Run()
	go s.SSEhandler.StartStream()

	authMiddleware := middleware.Auth(s.Auth)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Static("/assets", "./frontend/dist/assets")

	r.GET("/login", s.Auth.Login)
	r.GET("/auth/callback", s.Auth.Callback)
	r.GET("/ws", authMiddleware, func(c *gin.Context) {
		wshandler.ServeWs(s.WSHub, c)
	})

	apiPath := r.Group("/api")
	apiPath.Use(authMiddleware)
	{
		v1 := apiPath.Group("/v1")
		{
			//v1.GET("/editcount/:users" /*api.GetEditCounts*/, s.ApiService.GetEditCounts)
			v1.POST("/rollback", s.ApiService.Rollback)
			v1.GET("/editcount/:page", s.ApiService.GetPageContent)
		}
	}

	r.Run("127.0.0.1:8080")
}
