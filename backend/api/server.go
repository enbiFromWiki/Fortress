package api

import (
	"gateway/backend/auth"
	"gateway/backend/mediawiki"
	"gateway/backend/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	Auth       *auth.AuthService
	MWClient   *mediawiki.MediaWikiClient
	ApiService *APIService
}

func NewServer() *Server {
	mwClient := mediawiki.New("Overseer anti-vandalism application OAuth2 testing/0.2.0 (User:enbi@enwiki; lawfulbaguette@gmail.com)", "https://test.wikipedia.org")
	authService := auth.New(mwClient)
	apiClient := NewAPI(mwClient)
	return &Server{
		MWClient:   mwClient,
		Auth:       authService,
		ApiService: apiClient,
	}
}

func (s *Server) Start() {

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
