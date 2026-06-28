package eventstream

import (
	"bufio"
	"encoding/json"
	"fmt"
	"gateway/backend/mediawiki"

	//"gateway/backend/wshandler"
	"log"
	"net/http"
	"strings"
	"time"
)

// import (
// 	"bufio"
// 	"encoding/json"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"strings"
// )

type WMEventStream struct {
	ChangelogKind  string    `json:"changelog_kind"`
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
		UserCentralID  int       `json:"user_central_id"`
	} `json:"performer"`
	Revision struct {
		RevID            int64     `json:"rev_id"`
		RevDt            time.Time `json:"rev_dt"`
		IsMinorEdit      bool      `json:"is_minor_edit"`
		RevSha1          string    `json:"rev_sha1"`
		RevSize          int       `json:"rev_size"`
		RevParentID      int64     `json:"rev_parent_id"`
		Comment          string    `json:"comment"`
		IsContentVisible bool      `json:"is_content_visible"`
		IsEditorVisible  bool      `json:"is_editor_visible"`
		IsCommentVisible bool      `json:"is_comment_visible"`
		Editor           struct {
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
				SlotRole      string `json:"slot_role"`
				ContentModel  string `json:"content_model"`
				ContentSha1   string `json:"content_sha1"`
				ContentSize   int    `json:"content_size"`
				ContentFormat string `json:"content_format"`
				OriginRevID   int64  `json:"origin_rev_id"`
			} `json:"main"`
		} `json:"content_slots"`
	} `json:"revision"`
	PriorState struct {
		Revision struct {
			RevID            int64     `json:"rev_id"`
			RevDt            time.Time `json:"rev_dt"`
			IsMinorEdit      bool      `json:"is_minor_edit"`
			RevSha1          string    `json:"rev_sha1"`
			RevSize          int       `json:"rev_size"`
			RevParentID      int64     `json:"rev_parent_id"`
			Comment          string    `json:"comment"`
			IsContentVisible bool      `json:"is_content_visible"`
			IsEditorVisible  bool      `json:"is_editor_visible"`
			IsCommentVisible bool      `json:"is_comment_visible"`
			Editor           struct {
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
					SlotRole      string `json:"slot_role"`
					ContentModel  string `json:"content_model"`
					ContentSha1   string `json:"content_sha1"`
					ContentSize   int    `json:"content_size"`
					ContentFormat string `json:"content_format"`
					OriginRevID   int64  `json:"origin_rev_id"`
				} `json:"main"`
			} `json:"content_slots"`
		} `json:"revision"`
	} `json:"prior_state"`
	Schema string `json:"$schema"`
	Meta   struct {
		Stream    string    `json:"stream"`
		URI       string    `json:"uri"`
		ID        string    `json:"id"`
		Domain    string    `json:"domain"`
		RequestID string    `json:"request_id"`
		Dt        time.Time `json:"dt"`
		Topic     string    `json:"topic"`
		Partition int       `json:"partition"`
		Offset    int       `json:"offset"`
		Key       struct {
			WikiID string `json:"wiki_id"`
			PageID int    `json:"page_id"`
		} `json:"key"`
	} `json:"meta"`
}

type WMStreamer struct {
	MWClient *mediawiki.MediaWikiClient
	//WSHub    *wshandler.Hub
}

func New(mwclient *mediawiki.MediaWikiClient) *WMStreamer {
	return &WMStreamer{
		MWClient: mwclient,
	}
}

func (w *WMStreamer) StartWMStream() {
	req, err := http.NewRequest("GET", "https://stream.wikimedia.org/v2/stream/mediawiki.page_change.v1", nil)
	if err != nil {
		log.Fatal(err)
	}
	res, err := w.MWClient.DoWithUA(req)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()
	scanner := bufio.NewScanner(res.Body)

	for scanner.Scan() {
		if e := scanner.Err(); e != nil {
			log.Fatal(e)
		}
		line := scanner.Text()
		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		strippedLine := strings.TrimPrefix(line, "data: ")

		// Start of data processing

		var data WMEventStream

		err := json.Unmarshal([]byte(strippedLine), &data)
		if err != nil {
			log.Fatal(err)
		}

		if data.Performer.EditCount == 0 {
			fmt.Println(data.Performer.UserText)
		}
		// fmt.Println(line)
	}
}
