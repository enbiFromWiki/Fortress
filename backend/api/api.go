package api

//import "github.com/gin-gonic/gin"

// func GetEditCounts(c *gin.Context) {

// }

import (
	// "gateway/auth"
	"gateway/mediawiki"
)

type APIService struct {
	MWClient *mediawiki.MediaWikiClient
}
