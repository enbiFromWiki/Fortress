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

type WMEventStream struct {
	// ChangelogKind  string    `json:"changelog_kind"`
	PageChangeKind string    `json:"page_change_kind"`
	Dt             time.Time `json:"dt"`
	WikiID         string    `json:"wiki_id"`
	Page           struct {
		PageID             int    `json:"page_id"`
		PageTitle          string `json:"page_title"`
		NamespaceID        int    `json:"namespace_id"`
		IsRedirect         bool   `json:"is_redirect"`
		NamespaceIsContent bool   `json:"namespace_is_content"`
	} `json:"page"`
	Performer struct {
		UserText       string    `json:"user_text"`
		Groups         []string  `json:"groups"`
		IsTemp         bool      `json:"is_temp"`
		WikiID         string    `json:"wiki_id"`
		UserID         int       `json:"user_id"`
		EditCount      int       `json:"edit_count"`
		RegistrationDt time.Time `json:"registration_dt"`
		IsBot          bool      `json:"is_bot"`
		IsSystem       bool      `json:"is_system"`
		// UserCentralID  int       `json:"user_central_id"`
	} `json:"performer"`
	Revision struct {
		RevID       int64     `json:"rev_id"`
		RevDt       time.Time `json:"rev_dt"`
		IsMinorEdit bool      `json:"is_minor_edit"`
		RevSha1     string    `json:"rev_sha1"`
		RevSize     int       `json:"rev_size"`
		RevParentID int64     `json:"rev_parent_id"`
		Comment     string    `json:"comment"`
		// IsContentVisible bool      `json:"is_content_visible"`
		// IsEditorVisible  bool      `json:"is_editor_visible"`
		// IsCommentVisible bool      `json:"is_comment_visible"`
		Editor struct {
			UserText       string    `json:"user_text"`
			Groups         []string  `json:"groups"`
			IsTemp         bool      `json:"is_temp"`
			WikiID         string    `json:"wiki_id"`
			UserID         int       `json:"user_id"`
			EditCount      int       `json:"edit_count"`
			RegistrationDt time.Time `json:"registration_dt"`
			IsBot          bool      `json:"is_bot"`
			IsSystem       bool      `json:"is_system"`
			UserCentralID  int       `json:"user_central_id"`
		} `json:"editor"`
		ContentSlots struct {
			Main struct {
				// SlotRole      string `json:"slot_role"`
				// ContentModel  string `json:"content_model"`
				// ContentSha1   string `json:"content_sha1"`
				ContentSize int `json:"content_size"`
				// ContentFormat string `json:"content_format"`
				OriginRevID int64 `json:"origin_rev_id"`
			} `json:"main"`
		} `json:"content_slots"`
	} `json:"revision"`
	PriorState struct {
		Revision struct {
			RevID       int64     `json:"rev_id"`
			RevDt       time.Time `json:"rev_dt"`
			IsMinorEdit bool      `json:"is_minor_edit"`
			RevSize     int       `json:"rev_size"`
			RevParentID int64     `json:"rev_parent_id"`
			Comment     string    `json:"comment"`
			// IsContentVisible bool      `json:"is_content_visible"`
			// IsEditorVisible  bool      `json:"is_editor_visible"`
			// IsCommentVisible bool      `json:"is_comment_visible"`
			Editor struct {
				UserText       string    `json:"user_text"`
				Groups         []string  `json:"groups"`
				IsTemp         bool      `json:"is_temp"`
				WikiID         string    `json:"wiki_id"`
				UserID         int       `json:"user_id"`
				EditCount      int       `json:"edit_count"`
				RegistrationDt time.Time `json:"registration_dt"`
				IsBot          bool      `json:"is_bot"`
				IsSystem       bool      `json:"is_system"`
			} `json:"editor"`
			ContentSlots struct {
				Main struct {
					ContentSize   int    `json:"content_size"`
					ContentFormat string `json:"content_format"`
					OriginRevID   int64  `json:"origin_rev_id"`
				} `json:"main"`
			} `json:"content_slots"`
		} `json:"revision"`
	} `json:"prior_state"`
	// Schema string `json:"$schema"`
	Meta struct {
		Domain string `json:"domain"`
	} `json:"meta"`
}

type WMStreamer struct {
	// MWClient     *mediawiki.MediaWikiClient
	wss       *wshandler.WebSocketService
	sseClient *sse.Client
	mwClient  *mediawiki.MediaWikiClient
}

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
						"type": "notcurrentpage",
						"page": strings.Replace(dataJson.Page.PageTitle, "_", " ", -1),
						"wiki": dataJson.WikiID,
					}
				}
			}

			if user := dataJson.Performer; user.EditCount < 6 && dataJson.WikiID == "enwiki" {
				if user.UserText == "" {
					fmt.Println(string(msg.Data))
					return
				}

				w.handleEvent(&dataJson)

				fmt.Println(user.UserText + "@" + dataJson.WikiID)

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

type WSSentJSON struct {
	User          WSUser `json:"user"`
	Title         string `json:"title"`
	DiffHTML      string `json:"diffhtml"`
	NewID         int64  `json:"newid"`
	OldID         int64  `json:"oldid"`
	Wiki          string `json:"wiki"`
	WikiDomain    string `json:"domain"`
	DiffSize      int    `json:"diffsize"`
	ParsedComment string `json:"parsedcomment"`
}

func (w *WMStreamer) handleEvent(streamData *WMEventStream) {
	newid := streamData.Revision.RevID
	oldid := streamData.Revision.RevParentID
	diffSize := streamData.Revision.RevSize - streamData.PriorState.Revision.RevSize
	title := strings.Replace(streamData.Page.PageTitle, "_", " ", -1)
	if newid == 0 || oldid == 0 {
		streamStr, err := json.Marshal(streamData)
		if err != nil {
			fmt.Println("failed to marshal error with diff: " + err.Error())
			return
		}
		fmt.Println(string(streamStr))

	}
	apiPath := "https://" + streamData.Meta.Domain + "/w/api.php"

	res, err := w.mwClient.Get(map[string]string{
		"action":  "compare",
		"fromrev": fmt.Sprintf("%v", oldid),
		"torev":   fmt.Sprintf("%v", newid),
		"prop":    "diff|parsedcomment",
	}, "none", apiPath)

	for client := range w.wss.Hub.Clients {
		client.SeenPages = append(client.SeenPages, wshandler.WikiPage{
			Title: streamData.Page.PageTitle,
			Wiki:  streamData.WikiID,
		})
		fmt.Println(client.SeenPages)
	}

	if err != nil {
		fmt.Printf("error: %s", err.Error())
		return
	}

	var data MWCompareJSON

	err = json.Unmarshal(res, &data)
	if err != nil {
		fmt.Printf("error: %s", err.Error())
		return
	}

	body := data.Compare.Body
	comment := data.Compare.ToParsedComment
	performer := streamData.Performer
	sendingData := WSSentJSON{
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
	}
	w.wss.Hub.Broadcast(sendingData)
}
