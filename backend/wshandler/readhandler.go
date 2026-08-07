package wshandler

import (
	"encoding/json"
	"fmt"
	"gateway/mediawiki"

	"github.com/gin-gonic/gin"
)

type SentWSJSON struct {
	ID           string  `json:"id"`
	Action       string  `json:"action"`
	TargetUser   string  `json:"targetuser"`
	TargetTitle  string  `json:"targettitle"`
	TargetWiki   string  `json:"targetdomain"`
	Summary      string  `json:"summary"`
	Token        string  `json:"token"`
	WarnTP       string  `json:"warntp"`
	TargetWikiDB string  `json:"targetwiki"`
	Level        string  `json:"level"`
	WarnSummary  string  `json:"warnsummary"`
	Filters      Filters `json:"filters"`
	Reason       string  `json:"reason"`
}

type RollbackTokenJSON struct {
	Query struct {
		Tokens struct {
			Rollbacktoken string `json:"rollbacktoken"`
		} `json:"tokens"`
	} `json:"query"`
}

func handleIncomingMessage(client *Client, byteData []byte, mwclient *mediawiki.MediaWikiClient) {
	var data SentWSJSON
	fmt.Println(string(byteData))
	if err := json.Unmarshal(byteData, &data); err != nil {
		return
	}
	fmt.Println(data)

	switch data.Action {
	case "pause":
		{
			client.hub.Pause(client)
		}
	case "resume":
		{
			client.hub.Unpause(client)
		}
	case "watch":
		{
			client.watchedUsers[data.TargetUser] = true
			fmt.Println(client.watchedUsers)
		}
	case "unwatch":
		{
			delete(client.watchedUsers, data.TargetUser)
		}
	case "watchPage":
		{
			if data.TargetTitle == "" || data.TargetWikiDB == "" {
				return
			}
			client.watchedPages[WikiPage{
				Title: data.TargetTitle,
				Wiki:  data.TargetWikiDB,
			}] = true
		}
	case "unwatchPage":
		{
			if data.TargetTitle == "" || data.TargetWikiDB == "" {
				return
			}
			delete(client.watchedPages, WikiPage{
				Title: data.TargetTitle,
				Wiki:  data.TargetWikiDB,
			})
		}
	case "rollback":
		{
			if data.TargetWiki == "" || data.TargetUser == "" {
				return
			}

			res, err := mwclient.Get(map[string]string{
				"action": "query",
				"meta":   "tokens",
				"type":   "rollback",
			}, client.token, "https://"+data.TargetWiki+"/w/api.php")
			if err != nil {
				client.Send <- map[string]any{
					"type":   "response",
					"part":   "rollback",
					"status": "error",
					"id":     data.ID,
				}
				break
			}

			var tokRes RollbackTokenJSON
			json.Unmarshal(res, &tokRes)
			rbToken := tokRes.Query.Tokens.Rollbacktoken

			rbParams := map[string]string{
				"action": "rollback",
				"title":  data.TargetTitle,
				"user":   data.TargetUser,
				"token":  rbToken,
			}

			if summary := data.Summary; summary != "" {
				rbParams["summary"] = summary
			}

			res, err = mwclient.Post(map[string]string{
				"action":  "rollback",
				"title":   data.TargetTitle,
				"user":    data.TargetUser,
				"token":   rbToken,
				"summary": data.Summary,
			}, client.token, "https://"+data.TargetWiki+"/w/api.php")

			if err != nil {
				fmt.Println(err.Error())
				client.Send <- map[string]any{
					"type":   "response",
					"id":     data.ID,
					"status": "error",
					"error":  err.Error(),
				}
				break
			}
			client.Send <- map[string]any{
				"type":   "response",
				"part":   "rollback",
				"status": "success",
				"id":     data.ID,
			}
		}
	case "rollandwarn":
		{
			if data.TargetWiki == "" {
				return
			}

			res, err := mwclient.Get(map[string]string{
				"action": "query",
				"meta":   "tokens",
				"type":   "rollback",
			}, client.token, "https://"+data.TargetWiki+"/w/api.php")
			if err != nil {
				fmt.Println(err.Error())
				client.Send <- map[string]any{
					"type":   "response",
					"id":     data.ID,
					"part":   "rollback",
					"status": "error",
					"error":  err.Error(),
				}
				break
			}

			var tokRes RollbackTokenJSON
			json.Unmarshal(res, &tokRes)
			rbToken := tokRes.Query.Tokens.Rollbacktoken

			res, err = mwclient.Post(map[string]string{
				"action":  "rollback",
				"title":   data.TargetTitle,
				"user":    data.TargetUser,
				"token":   rbToken,
				"summary": data.Summary,
			}, client.token, "https://"+data.TargetWiki+"/w/api.php")

			if err != nil {
				fmt.Println(err.Error())
				client.Send <- map[string]any{
					"type":   "response",
					"id":     data.ID,
					"part":   "rollback",
					"status": "error",
					"error":  err.Error(),
				}
				break
			}
			client.Send <- map[string]any{
				"type":   "response",
				"part":   "rollback",
				"status": "success",
				"id":     data.ID,
			}
			level := data.Level
			var result mediawiki.WarnResult
			switch level {
			case "", "auto":
				result, err = mwclient.AutoWarnUser(data.TargetUser, data.WarnTP, client.token, data.TargetWiki, data.TargetTitle, data.WarnSummary)
			case "single":
				result, err = mwclient.SingleIssueWarn(data.TargetUser, data.WarnTP, client.token, data.TargetWiki, data.TargetTitle, data.WarnSummary)
			}
			if err != nil {
				client.Send <- map[string]any{
					"type":   "response",
					"part":   "warn",
					"id":     data.ID,
					"status": "error",
					"error":  err.Error(),
				}
				break
			}

			if result == "failed" {
				client.Send <- map[string]any{
					"type":   "response",
					"part":   "warn",
					"id":     data.ID,
					"status": "error",
					"error":  "unknown",
				}
				break
			}
			client.Send <- map[string]any{
				"type":   "response",
				"part":   "warn",
				"status": result,
				"id":     data.ID,
			}

		}
	case "updatefilters":
		fmt.Println("Filters updated")
		client.hub.changeFilter <- FilterChangeRequest{
			client:  client,
			filters: data.Filters,
		}
		fmt.Println("new filters:", client.filters)
	case "aiv":
		if data.TargetUser == "" || data.Reason == "" || data.Summary == "" || data.ID == "" {
			return
		}
		fmt.Println("AIV REPORT")
		reported, err := mwclient.ReportToTestwikiAIV(data.TargetUser, data.Reason, data.Summary, client.token)
		if err != nil {
			client.Send <- gin.H{
				"type":   "response",
				"status": "error",
				"id":     data.ID,
				"error":  err.Error(),
			}
			return
		}
		if !reported {
			client.Send <- gin.H{
				"type":   "response",
				"status": "alreadygone",
				"id":     data.ID,
			}
			return
		}
		client.Send <- gin.H{
			"type":   "response",
			"status": "success",
			"id":     data.ID,
		}
	}

}
