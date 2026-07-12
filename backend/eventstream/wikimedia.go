package eventstream

import (
	"encoding/json"
	"fmt"
	"slices"
	"strings"

	//"gateway/mediawiki"
	"gateway/mediawiki"
	"gateway/wshandler"
	"time"

	"github.com/r3labs/sse/v2"
)

func New(wss *wshandler.WebSocketService, mwClient *mediawiki.MediaWikiClient) *WMStreamer {
	client := sse.NewClient("https://stream.wikimedia.org/v2/stream/mediawiki.page_change.v1")
	client.Headers = map[string]string{
		"User-Agent": "Fortress anti-vandalism application OAuth2 testing/0.2.0 (User:enbi@enwiki; lawfulbaguette@gmail.com)",
	}

	return &WMStreamer{
		wss:       wss,
		sseClient: client,
		mwClient:  mwClient,
	}
}

func (w *WMStreamer) StartStream() {
	fmt.Println("start")

	for {
		var prevItem string

		var dataJson WMEventStream
		w.sseClient.SubscribeRaw(func(msg *sse.Event) {
			data := msg.Data
			if string(msg.Data) == prevItem || len(data) == 0 {
				return
			}
			prevItem = string(data)
			json.Unmarshal(data, &dataJson)
			if dataJson.PageChangeKind != "edit" {
				return
			}

			for client := range w.wss.Hub.Clients {
				if slices.Contains(client.SeenPages, wshandler.WikiPage{
					Title: dataJson.Page.PageTitle,
					Wiki:  dataJson.WikiID,
				}) {
					client.Send <- map[string]any{
						"type":    "revchange",
						"page":    strings.Replace(dataJson.Page.PageTitle, "_", " ", -1),
						"wiki":    dataJson.WikiID,
						"comment": dataJson.Revision.Comment,
						"user":    dataJson.Performer.UserText,
						"revid":   dataJson.Revision.RevID,
						"domain":  dataJson.Meta.Domain,
					}
				}
			}

			if user := dataJson.Performer; user.EditCount < 10 && slices.Contains([]string{"enwiki", "frwiki", "commonswiki", "wikidatawiki"}, dataJson.WikiID) {
				if user.UserText == "" {
					fmt.Println(string(msg.Data))
					return
				}

				w.handleEvent(&dataJson)

			}
		})

		fmt.Println("STREAM ENDED; RECONNECTING")

		time.Sleep(time.Second)
	}
}

type MWCompareJSON struct {
	Compare struct {
		ToParsedComment string `json:"toparsedcomment"`
		Body            string `json:"body"`
	} `json:"compare"`
}

type WSUser struct {
	Username       string    `json:"username"`
	Userid         int       `json:"userid"`
	IsTemp         bool      `json:"istemp"`
	EditCount      int       `json:"editcount"`
	UserGroups     []string  `json:"usergroups"`
	UserCreateDate time.Time `json:"userage"`
}

type RecentChangeJSON struct {
	User          WSUser         `json:"user"`
	Title         string         `json:"title"`
	DiffHTML      string         `json:"diffhtml"`
	NewID         int64          `json:"newid"`
	OldID         int64          `json:"oldid"`
	Wiki          string         `json:"wiki"`
	WikiDomain    string         `json:"domain"`
	DiffSize      int            `json:"diffsize"`
	ParsedComment string         `json:"parsedcomment"`
	History       []*HistoryEdit `json:"history"`
	Type          string         `json:"type"`
	Watched       bool           `json:"watched"`
	OldSize       int            `json:"oldsize"`
	NewSize       int            `json:"newsize"`
}

func (w *WMStreamer) handleEvent(streamData *WMEventStream) {
	newid := streamData.Revision.RevID
	oldid := streamData.Revision.RevParentID
	diffSize := streamData.Revision.RevSize - streamData.PriorState.Revision.RevSize
	title := strings.Replace(streamData.Page.PageTitle, "_", " ", -1)
	if newid == 0 || oldid == 0 {
		return
	}
	apiPath := "https://" + streamData.Meta.Domain + "/w/api.php"

	res, err := w.mwClient.Get(map[string]string{
		"action":  "query",
		"prop":    "revisions",
		"titles":  streamData.Page.PageTitle,
		"rvprop":  "ids|timestamp|flags|user|tags|parsedcomment",
		"rvlimit": "15",
	}, "none", apiPath)

	if err != nil {
		fmt.Printf("error: %s", err.Error())
		return
	}

	var histData HistoryJSON
	json.Unmarshal(res, &histData)

	history := histData.Query.Pages[0].Revisions
	if history[0].Revid != int(streamData.Revision.RevID) {
		return
	}

	firstRevisionNotByUser := -1

	for _, edit := range history {
		if edit.User != streamData.Performer.UserText {
			firstRevisionNotByUser = edit.Revid
			break
		} else {
			edit.SameUser = true
		}
	}

	if firstRevisionNotByUser == -1 {
		firstRevisionNotByUser = history[len(history)-1].Revid
	}

	user := streamData.Performer
	userEC := user.EditCount
	wikiID := streamData.WikiID

	var data MWCompareJSON

	res, err = w.mwClient.Get(map[string]string{
		"action":  "compare",
		"fromrev": fmt.Sprintf("%v", firstRevisionNotByUser),
		"torev":   fmt.Sprintf("%v", newid),
		"prop":    "diff|parsedcomment",
	}, "none", apiPath)
	if err != nil {
		fmt.Printf("error: %s", err.Error())
		return
	}
	err = json.Unmarshal(res, &data)
	if err != nil {
		fmt.Printf("error: %s", err.Error())
		return
	}

	body := data.Compare.Body
	comment := data.Compare.ToParsedComment
	performer := streamData.Performer
	sendingData := RecentChangeJSON{
		User: WSUser{
			Username:       performer.UserText,
			Userid:         performer.UserID,
			IsTemp:         performer.IsTemp,
			EditCount:      performer.EditCount,
			UserGroups:     performer.Groups,
			UserCreateDate: performer.RegistrationDt,
		},
		Title:         title,
		DiffHTML:      body,
		NewID:         newid,
		OldID:         oldid,
		Wiki:          streamData.WikiID,
		WikiDomain:    streamData.Meta.Domain,
		DiffSize:      diffSize,
		ParsedComment: comment,
		History:       history,
		Type:          "new",
		Watched:       false,
		OldSize:       streamData.PriorState.Revision.RevSize,
		NewSize:       streamData.Revision.RevSize,
	}

	for client := range w.wss.Hub.Clients {
		client.SeenPages = append(client.SeenPages, wshandler.WikiPage{
			Title: streamData.Page.PageTitle,
			Wiki:  streamData.WikiID,
		})
		if watched, ok := client.WatchedUsers[user.UserText]; ok && watched {
			fmt.Println("WATCHED USER:::", user.UserText)
			sendingData.Watched = true
			client.Send <- sendingData
			return
		} else {
			fmt.Println(client.WatchedUsers[user.UserText])
		}
		if slices.Contains(client.Wikis, wikiID) && userEC <= client.MaxEditCount {
			client.Send <- sendingData
		}
	}
}
