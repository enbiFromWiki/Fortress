package eventstream

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"slices"
	"strings"

	//"gateway/mediawiki"
	"gateway/global"
	"gateway/mediawiki"
	"gateway/wshandler"
	"time"

	"github.com/r3labs/sse/v2"
)

func New(wss *wshandler.WebSocketService, mwClient *mediawiki.MediaWikiClient) *WMStreamer {
	client := sse.NewClient("https://stream.wikimedia.org/v2/stream/mediawiki.page_change.v1,recentchange")
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

		w.sseClient.SubscribeRaw(func(msg *sse.Event) {
			var dataJson WMEventStream
			data := msg.Data
			if string(msg.Data) == prevItem || len(data) == 0 {
				return
			}
			prevItem = string(data)
			json.Unmarshal(data, &dataJson)
			if dataJson.Meta.Stream == "mediawiki.recentchange" {
				if dataJson.LogType != "block" {
					return
				}
				if dataJson.LogAction != "block" {
					return
				}
				formattedTitle := ""
				titleSlices := strings.Split(dataJson.Title, ":")
				if len(titleSlices) != 2 {
					if len(titleSlices) != 1 {
						return
					}
					formattedTitle = titleSlices[0]

				} else {
					formattedTitle = titleSlices[1]
				}
				if formattedTitle == "" {
					return
				}
				if _, _, err := net.ParseCIDR(formattedTitle); err == nil || net.ParseIP(formattedTitle) != nil {
					fmt.Println("IP address", formattedTitle, "got blocked")
					return
				}
				var out bytes.Buffer

				err := json.Indent(&out, data, "", "  ")
				if err != nil {
					log.Fatal(err)
				}

				fmt.Println(out.String())
				fmt.Println(formattedTitle, "got blocked!")
				w.wss.Hub.Broadcast(global.BlockUpdate{
					Type: "block",
					User: formattedTitle,
					Wiki: dataJson.Wiki,
				})
				return
			}
			if dataJson.PageChangeKind != "edit" {
				return
			}

			w.wss.Hub.Broadcast(global.RevUpdate{
				Type:     "revchange",
				Page:     strings.ReplaceAll(dataJson.Page.PageTitle, "_", " "),
				Wiki:     dataJson.WikiID,
				Comment:  dataJson.Revision.Comment,
				User:     dataJson.Performer.UserText,
				Revid:    dataJson.Revision.RevID,
				Parentid: dataJson.Revision.RevParentID,
				Domain:   dataJson.Meta.Domain,
			})

			if user := dataJson.Performer; ((user.EditCount < 10) && slices.Contains([]string{"enwiki", "metawiki", "testwiki"}, dataJson.WikiID)) || dataJson.WikiID == "testwiki" {
				if user.UserText == "" {
					fmt.Println(string(msg.Data))
					return
				}

				if dataJson.WikiID == "testwiki" {
					fmt.Println("TESTWIKI BY", user.UserText)
				}

				w.handleEvent(&dataJson)

			}
		})

		fmt.Println("STREAM ENDED; RECONNECTING")

		time.Sleep(time.Millisecond * 500)
	}
}

type MWCompareJSON struct {
	Compare struct {
		ToParsedComment string `json:"toparsedcomment"`
		Body            string `json:"body"`
	} `json:"compare"`
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

	var histData global.HistoryJSON
	json.Unmarshal(res, &histData)

	history := histData.Query.Pages[0].Revisions
	if len(history) == 0 {
		fmt.Println("broken hist: ", histData)
		return
	}
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

	wikiID := streamData.WikiID
	user := streamData.Performer
	talkPage, ok, err := w.mwClient.GetSinglePageContent("User talk:"+user.UserText, streamData.Meta.Domain)
	if err != nil {
		fmt.Println(err)
		return
	}
	warningLevel := mediawiki.GetWarningLevel(talkPage)

	if !ok {
		fmt.Println(title, wikiID)
	}
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
	sendingData := global.RecentChange{
		User: global.WSUser{
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
		DiffID:        firstRevisionNotByUser,
		Wiki:          streamData.WikiID,
		WikiDomain:    streamData.Meta.Domain,
		DiffSize:      diffSize,
		ParsedComment: comment,
		History:       history,
		Type:          "new",
		Watched:       false,
		OldSize:       streamData.PriorState.Revision.RevSize,
		NewSize:       streamData.Revision.RevSize,
		Level:         warningLevel,
	}

	w.wss.Hub.Broadcast(sendingData)
}
