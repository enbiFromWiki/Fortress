package wshandler

import (
	"encoding/json"
	"fmt"
	"gateway/mediawiki"
	"log"
)

type SentWSJSON struct {
	ID          string `json:"id"`
	Action      string `json:"action"`
	TargetUser  string `json:"targetuser"`
	TargetTitle string `json:"targettitle"`
	TargetWiki  string `json:"targetdomain"`
	Summary     string `json:"summary"`
	Token       string `json:"token"`
	WarnTP      string `json:"warntp"`
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
			client.paused = true
		}
	case "resume":
		{
			client.paused = false
		}
	case "watch":
		{
			client.WatchedUsers[data.TargetUser] = true
			fmt.Println(client.WatchedUsers)
		}
	case "unwatch":
		{
			client.WatchedUsers[data.TargetUser] = false
		}
	case "rollback":
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
				log.Fatal(err)
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
				log.Fatal(err)
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
			_, err = mwclient.AutoWarnUser(data.TargetUser, data.WarnTP, client.token, data.TargetWiki)
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

			client.Send <- map[string]any{
				"type":   "response",
				"part":   "warn",
				"status": "success",
				"id":     data.ID,
			}

		}
	}
}
