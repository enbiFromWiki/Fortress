package auth

import (
	"encoding/json"
	"fmt"
	"gateway/util"
	"slices"

	"github.com/gin-gonic/gin"
)

func (a *AuthService) Me(c *gin.Context) {
	token, exists := c.Get("accessToken")
	if !exists || token == "" {
		util.ReturnError(c, 401, "Middleware failure/unauthorized")
		return
	}
	res, err := a.MWApi.Get(map[string]string{
		"action":  "query",
		"meta":    "globaluserinfo",
		"guiprop": "groups|merged",
	}, token.(string))

	if err != nil {
		util.ReturnError(c, 502, err.Error())
	}
	var guidata GlobalUserInfoJSON
	err = json.Unmarshal(res, &guidata)
	if err != nil {
		util.ReturnError(c, 500, "failed to unmarshal globaluserinfo json")
		fmt.Println(err)
		return
	}

	query := guidata.Query.Globaluserinfo

	name := query.Name

	if name == "" {
		util.ReturnError(c, 502, "MediaWiki API failure")
		return
	}

	if query.Locked {
		util.ReturnError(c, 403, "locked")
		return
	}

	// if slices.Contains(guiquery.Groups, "global-rollbacker") {
	// 	c.JSON(200, gin.H{
	// 		"status": "success",
	// 		"user":   name,
	// 		"gr":     true,
	// 	})
	// 	return
	// }

	// if slices.Contains(guiquery.Groups, "steward") {
	// 	c.JSON(200, gin.H{
	// 		"status":  "success",
	// 		"user":    name,
	// 		"steward": true,
	// 	})
	// 	return
	// }

	var wikisWhereAdmin []string
	var wikisWhereRollback []string

	for _, wiki := range query.Merged {
		groups := wiki.Groups
		if slices.Contains(groups, "sysop") {
			wikisWhereAdmin = append(wikisWhereAdmin, wiki.Wiki)
		}
		if slices.Contains(groups, "rollbacker") {
			wikisWhereRollback = append(wikisWhereRollback, wiki.Wiki)
		}
	}

	isGR := slices.Contains(query.Groups, "global-rollbacker")
	isStew := slices.Contains(query.Groups, "steward")

	if isGR {
		c.JSON(200, gin.H{
			"status":     "success",
			"gr":         true,
			"adminWikis": wikisWhereAdmin,
		})
		return
	}

	if isStew {
		c.JSON(200, gin.H{
			"status":     "success",
			"steward":    true,
			"adminWikis": wikisWhereAdmin,
		})
		return
	}

	if len(wikisWhereAdmin) == 0 && len(wikisWhereRollback) == 0 && !isGR && !isStew {
		fmt.Println("status before:", c.Writer.Written())
		util.ReturnError(c, 403, "rollback")
		return
	}

	fmt.Println("written?", c.Writer.Written())

	c.JSON(200, gin.H{
		"status":        "success",
		"user":          name,
		"rollbackWikis": wikisWhereRollback,
		"adminWikis":    wikisWhereAdmin,
	})
}
