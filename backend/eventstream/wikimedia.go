package eventstream

// import (
// 	"bufio"
// 	"encoding/json"
// 	"fmt"
// 	"gateway/backend/mediawiki"

// 	//"gateway/backend/wshandler"
// 	"net/http"
// 	"strings"
// 	"time"
// )

// // import (
// // 	"bufio"
// // 	"encoding/json"
// // 	"fmt"
// // 	"log"
// // 	"net/http"
// // 	"strings"
// // )

// type WMEventStream struct {
// 	// ChangelogKind  string    `json:"changelog_kind"`
// 	PageChangeKind string    `json:"page_change_kind"`
// 	Dt             time.Time `json:"dt"`
// 	WikiID         string    `json:"wiki_id"`
// 	Page           struct {
// 		PageID      int    `json:"page_id"`
// 		PageTitle   string `json:"page_title"`
// 		NamespaceID int    `json:"namespace_id"`
// 		IsRedirect  bool   `json:"is_redirect"`
// 		// NamespaceIsContent bool   `json:"namespace_is_content"`
// 	} `json:"page"`
// 	Performer struct {
// 		UserText       string    `json:"user_text"`
// 		Groups         []string  `json:"groups"`
// 		IsTemp         bool      `json:"is_temp"`
// 		WikiID         string    `json:"wiki_id"`
// 		UserID         int       `json:"user_id"`
// 		EditCount      int       `json:"edit_count"`
// 		RegistrationDt time.Time `json:"registration_dt"`
// 		IsBot          bool      `json:"is_bot"`
// 		IsSystem       bool      `json:"is_system"`
// 		// UserCentralID  int       `json:"user_central_id"`
// 	} `json:"performer"`
// 	Revision struct {
// 		RevID       int64     `json:"rev_id"`
// 		RevDt       time.Time `json:"rev_dt"`
// 		IsMinorEdit bool      `json:"is_minor_edit"`
// 		RevSha1     string    `json:"rev_sha1"`
// 		RevSize     int       `json:"rev_size"`
// 		RevParentID int64     `json:"rev_parent_id"`
// 		Comment     string    `json:"comment"`
// 		// IsContentVisible bool      `json:"is_content_visible"`
// 		// IsEditorVisible  bool      `json:"is_editor_visible"`
// 		// IsCommentVisible bool      `json:"is_comment_visible"`
// 		Editor struct {
// 			UserText       string    `json:"user_text"`
// 			Groups         []string  `json:"groups"`
// 			IsTemp         bool      `json:"is_temp"`
// 			WikiID         string    `json:"wiki_id"`
// 			UserID         int       `json:"user_id"`
// 			EditCount      int       `json:"edit_count"`
// 			RegistrationDt time.Time `json:"registration_dt"`
// 			IsBot          bool      `json:"is_bot"`
// 			IsSystem       bool      `json:"is_system"`
// 			UserCentralID  int       `json:"user_central_id"`
// 		} `json:"editor"`
// 		ContentSlots struct {
// 			Main struct {
// 				// SlotRole      string `json:"slot_role"`
// 				// ContentModel  string `json:"content_model"`
// 				// ContentSha1   string `json:"content_sha1"`
// 				ContentSize int `json:"content_size"`
// 				// ContentFormat string `json:"content_format"`
// 				OriginRevID int64 `json:"origin_rev_id"`
// 			} `json:"main"`
// 		} `json:"content_slots"`
// 	} `json:"revision"`
// 	PriorState struct {
// 		Revision struct {
// 			RevID       int64     `json:"rev_id"`
// 			RevDt       time.Time `json:"rev_dt"`
// 			IsMinorEdit bool      `json:"is_minor_edit"`
// 			RevSize     int       `json:"rev_size"`
// 			RevParentID int64     `json:"rev_parent_id"`
// 			Comment     string    `json:"comment"`
// 			// IsContentVisible bool      `json:"is_content_visible"`
// 			// IsEditorVisible  bool      `json:"is_editor_visible"`
// 			// IsCommentVisible bool      `json:"is_comment_visible"`
// 			Editor struct {
// 				UserText       string    `json:"user_text"`
// 				Groups         []string  `json:"groups"`
// 				IsTemp         bool      `json:"is_temp"`
// 				WikiID         string    `json:"wiki_id"`
// 				UserID         int       `json:"user_id"`
// 				EditCount      int       `json:"edit_count"`
// 				RegistrationDt time.Time `json:"registration_dt"`
// 				IsBot          bool      `json:"is_bot"`
// 				IsSystem       bool      `json:"is_system"`
// 			} `json:"editor"`
// 			ContentSlots struct {
// 				Main struct {
// 					ContentSize   int    `json:"content_size"`
// 					ContentFormat string `json:"content_format"`
// 					OriginRevID   int64  `json:"origin_rev_id"`
// 				} `json:"main"`
// 			} `json:"content_slots"`
// 		} `json:"revision"`
// 	} `json:"prior_state"`
// 	// Schema string `json:"$schema"`
// 	Meta struct {
// 		Domain string `json:"domain"`
// 	} `json:"meta"`
// }

// type WMStreamer struct {
// 	MWClient *mediawiki.MediaWikiClient
// 	//WSHub    *wshandler.Hub
// }

// func New(mwclient *mediawiki.MediaWikiClient) *WMStreamer {
// 	return &WMStreamer{
// 		MWClient: mwclient,
// 	}
// }

// func (w *WMStreamer) Connect() {
// 	for {
// 		w.ReadWMStream()
// 		fmt.Println("dropped connection")
// 		time.Sleep(time.Second)
// 	}
// }

// func (w *WMStreamer) ReadWMStream() error {
// 	req, err := http.NewRequest("GET", "https://stream.wikimedia.org/v2/stream/mediawiki.page_change.v1", nil)
// 	if err != nil {
// 		return err
// 	}
// 	res, err := w.MWClient.DoWithUA(req)
// 	if err != nil {
// 		return err
// 	}
// 	defer res.Body.Close()
// 	scanner := bufio.NewScanner(res.Body)

// 	for scanner.Scan() {
// 		line := scanner.Text()
// 		if !strings.HasPrefix(line, "data: ") {
// 			continue
// 		}

// 		strippedLine := strings.TrimPrefix(line, "data: ")

// 		// Start of data processing

// 		var data WMEventStream

// 		err := json.Unmarshal([]byte(strippedLine), &data)
// 		if err != nil {
// 			fmt.Println(err)
// 			continue
// 		}

// 		if data.Performer.EditCount == 0 {
// 			fmt.Println(data.Performer.UserText)
// 		}
// 		// fmt.Println(line)
// 	}

// 	return scanner.Err()
// }
