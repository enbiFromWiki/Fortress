package wshandler

import (
	"encoding/json"
)

type SentWSJSON struct {
	Action      string `json:"action"`
	TargetUser  string `json:"targetuser"`
	TargetTitle string `json:"targettitle"`
	TargetWiki  string `json:"targetdomain"`
	Summary     string `json:"summary"`
	Token       string `json:"token"`
}

func handleIncomingMessage(client *Client, byteData []byte) {
	var data SentWSJSON
	if err := json.Unmarshal(byteData, &data); err != nil {
		return
	}

	switch data.Action {
	case "pause":
		{
			client.paused = true
		}
	case "resume":
		{
			client.paused = false
		}
		// case "rollback": {
		// 	if data.TargetWiki == "" {
		// 		return
		// 	}
		// 	res, err := w.MWClient.Post(map[string]string{
		// 		"action": "rollback",
		// 		"title": data.TargetTitle,
		// 		"user": data.TargetUser,
		// 		"token": data.Token,
		// 		"summary": data.Summary,
		// 	}, client.token, "https://"+data.TargetWiki+"/w/api.php")

		// 	if err != nil {
		// 		if err.Error() === "badtoken" {
		// 			return map[string]any{
		// 				"status": "error"
		// 			}
		// 		}
		// 	}
		// }
	}
}
