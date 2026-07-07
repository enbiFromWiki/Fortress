package wshandler

import (
	"encoding/json"
	"fmt"
	"gateway/mediawiki"
	"log"
)

type SentWSJSON struct {
	Action      string `json:"action"`
	TargetUser  string `json:"targetuser"`
	TargetTitle string `json:"targettitle"`
	TargetWiki  string `json:"targetdomain"`
	Summary     string `json:"summary"`
	Token       string `json:"token"`
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
				if err.Error() == "badtoken" {
					panic(err)
				}
			}
		}
	}
}
