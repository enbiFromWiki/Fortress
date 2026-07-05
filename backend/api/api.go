package api

//import "github.com/gin-gonic/gin"

// func GetEditCounts(c *gin.Context) {

// }

import (
	"encoding/json"
	"fmt"

	// "gateway/auth"
	"gateway/mediawiki"
	"gateway/util"

	"github.com/gin-gonic/gin"
)

type APIService struct {
	MWClient *mediawiki.MediaWikiClient
}

type RollbackTokenJSON struct {
	Query struct {
		Tokens struct {
			Rollbacktoken string `json:"rollbacktoken"`
		} `json:"tokens"`
	} `json:"query"`
}

type RollbackRequest struct {
	Page   string `json:"page" binding:"required"`
	User   string `json:"user" binding:"required"`
	Server string `json:"server" binding:"required"`
	//Summary string `json:"summary"`
}

type EditCountResSingleUser struct {
	UserID    int
	Name      string
	Editcount int
}

type EditCountRes struct {
	Query struct {
		Users []EditCountResSingleUser
	}
}

func NewAPI(mwClient *mediawiki.MediaWikiClient) *APIService {
	return &APIService{
		MWClient: mwClient,
	}
}

func (a *APIService) Rollback(c *gin.Context) {
	token, ok := c.Get("accessToken")
	if !ok {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Middleware auth failure",
		})
		return
	}
	postBody := RollbackRequest{}

	if err := c.ShouldBindJSON(&postBody); err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "Failed to unmarshal POST body",
		})
		return
	}

	rollbackTokenJson := RollbackTokenJSON{}

	res, err := a.MWClient.Get(map[string]string{
		"action": "query",
		"meta":   "tokens",
		"type":   "rollback",
	}, token.(string), "https://test.wikipedia.org/w/api.php")
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "failed to get token",
			"code":   err.Error(),
		})
		return
	}

	err = json.Unmarshal(res, &rollbackTokenJson)
	if err != nil {
		util.ReturnError(c, 500, "Failed to unmarshal json")
		return
	}

	fmt.Println(string(res))

	csrfToken := rollbackTokenJson.Query.Tokens.Rollbacktoken
	res, err = a.MWClient.Post(map[string]string{
		"action": "rollback",
		"title":  postBody.Page,
		"user":   postBody.User,
		"token":  csrfToken,
	}, token.(string), "https://test.wikipedia.org/w/api.php")
	if err != nil {
		util.ReturnError(c, 500, err.Error())
		return
	}
	c.JSON(200, gin.H{
		"status": "success",
		"res":    string(res),
	})
}

func (a *APIService) GetEditCounts(c *gin.Context) {
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
		return
	}

	wikiApi := wiki + "/w/api.php"

	res, err := a.MWClient.Get(map[string]string{
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
		return
	}
	c.String(200, string(res))
}

type ContentResponseJSON struct {
	Query struct {
		Pages []struct {
			Revisions []struct {
				Slots struct {
					Main struct {
						Content string `json:"content"`
					} `json:"main"`
				} `json:"slots"`
			} `json:"revisions"`
		} `json:"pages"`
	} `json:"query"`
}

func (a *APIService) GetPageContent(c *gin.Context) {
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
		return
	}

	title := c.Param("page")

	wikiApi := wiki + "/w/api.php"

	res, err := a.MWClient.Get(map[string]string{
		"action":  "query",
		"prop":    "revisions",
		"titles":  title,
		"rvprop":  "ids|timestamp|flags|comment|user|content",
		"rvslots": "main",
	}, token.(string), wikiApi)

	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"error":  "failed to get content",
		})
		return
	}

	c.String(200, string(res))
}
