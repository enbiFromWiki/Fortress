package eventstream

import (
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
		Stream string `json:"stream"`
	} `json:"meta"`
	Type string `json:"type"`
}

type HistoryJSON struct {
	Query struct {
		Pages []struct {
			Title     string         `json:"title"`
			Revisions []*HistoryEdit `json:"revisions"`
		} `json:"pages"`
	} `json:"query"`
}

type HistoryEdit struct {
	Revid         int       `json:"revid"`
	Parentid      int       `json:"parentid"`
	Minor         bool      `json:"minor"`
	User          string    `json:"user"`
	Timestamp     time.Time `json:"timestamp"`
	Parsedcomment string    `json:"parsedcomment,omitempty"`
	Tags          []string  `json:"tags"`
	Temp          bool      `json:"temp,omitempty"`
	Commenthidden bool      `json:"commenthidden,omitempty"`
	Suppressed    bool      `json:"suppressed,omitempty"`
	SameUser      bool      `json:"sameuser,omitempty"`
}

type WMStreamer struct {
	// MWClient     *mediawiki.MediaWikiClient
	wss       *wshandler.WebSocketService
	sseClient *sse.Client
	mwClient  *mediawiki.MediaWikiClient
}
