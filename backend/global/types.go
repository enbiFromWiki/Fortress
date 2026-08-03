package global

import "time"

type RevUpdate struct {
	Type     string `json:"type"`
	Page     string `json:"page"`
	Wiki     string `json:"wiki"`
	Comment  string `json:"comment"`
	User     string `json:"user"`
	Revid    int    `json:"revid"`
	Parentid int    `json:"parentid"`
	Domain   string `json:"domain"`
}

type BlockUpdate struct {
	Type string `json:"type"`
	User string `json:"user"`
	Wiki string `json:"wiki"`
}

type WebSocketUser struct {
	Username       string    `json:"username"`
	Userid         int       `json:"userid"`
	IsTemp         bool      `json:"istemp"`
	EditCount      int       `json:"editcount"`
	UserGroups     []string  `json:"usergroups"`
	UserCreateDate time.Time `json:"userage"`
}

type RecentChange struct {
	User          WebSocketUser  `json:"user"`
	Title         string         `json:"title"`
	DiffHTML      string         `json:"diffhtml"`
	NewID         int            `json:"newid"`
	OldID         int            `json:"oldid"`
	Wiki          string         `json:"wiki"`
	WikiDomain    string         `json:"domain"`
	DiffSize      int            `json:"diffsize"`
	ParsedComment string         `json:"parsedcomment"`
	History       []*HistoryEdit `json:"history"`
	Type          string         `json:"type"`
	Watched       bool           `json:"watched"`
	PageWatched   bool           `json:"pagewatched"`
	OldSize       int            `json:"oldsize"`
	NewSize       int            `json:"newsize"`
	DiffID        int            `json:"diffid"`
	Level         int            `json:"level"`
}

func (w RecentChange) GetType() string {
	return w.Type
}
func (w RevUpdate) GetType() string {
	return w.Type
}
func (w BlockUpdate) GetType() string {
	return w.Type
}

func (w NewPageUpdate) GetType() string {
	return w.Type
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

type HistoryJSON struct {
	Query struct {
		Pages []struct {
			Title     string         `json:"title"`
			Revisions []*HistoryEdit `json:"revisions"`
		} `json:"pages"`
	} `json:"query"`
}

type NewPageUpdate struct {
	User          WebSocketUser  `json:"user"`
	Title         string         `json:"title"`
	DiffHTML      string         `json:"diffhtml"`
	NewID         int            `json:"newid"`
	Wiki          string         `json:"wiki"`
	WikiDomain    string         `json:"domain"`
	DiffSize      int            `json:"diffsize"`
	ParsedComment string         `json:"parsedcomment"`
	History       []*HistoryEdit `json:"history"`
	Type          string         `json:"type"`
	Watched       bool           `json:"watched"`
	PageWatched   bool           `json:"pagewatched"`
	NewSize       int            `json:"newsize"`
	Level         int            `json:"level"`
}
