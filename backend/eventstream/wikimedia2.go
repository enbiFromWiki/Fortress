package eventstream

import (
	"encoding/json"
	"fmt"

	//"gateway/backend/mediawiki"
	"gateway/backend/wshandler"
	"time"

	"github.com/r3labs/sse/v2"
)

type WMEventStream struct {
	// ChangelogKind  string    `json:"changelog_kind"`
	PageChangeKind string    `json:"page_change_kind"`
	Dt             time.Time `json:"dt"`
	WikiID         string    `json:"wiki_id"`
	Page           struct {
		PageID      int    `json:"page_id"`
		PageTitle   string `json:"page_title"`
		NamespaceID int    `json:"namespace_id"`
		IsRedirect  bool   `json:"is_redirect"`
		// NamespaceIsContent bool   `json:"namespace_is_content"`
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
	hub       *wshandler.Hub
	sseClient *sse.Client
}

func New(hub *wshandler.Hub) *WMStreamer {
	client := sse.NewClient("https://stream.wikimedia.org/v2/stream/mediawiki.page_change.v1")
	client.Headers = map[string]string{
		"User-Agent": "Overseer anti-vandalism application OAuth2 testing/0.2.0 (User:enbi@enwiki; lawfulbaguette@gmail.com)",
	}

	return &WMStreamer{
		hub:       hub,
		sseClient: client,
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

			if user := dataJson.Performer; user.EditCount == 0 {
				if user.UserText == "" {
					fmt.Println(string(msg.Data))
					return
				}

				w.hub.Broadcast([]byte(user.UserText))

				fmt.Println(user.UserText + "@" + dataJson.WikiID)

			}
		})

		fmt.Println("STREAM ENDED; RECONNECTING")

		time.Sleep(time.Second)
	}
}
