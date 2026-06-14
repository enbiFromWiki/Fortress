package wiki

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Contrib struct {
	User          string  `json:"user"`
	UserID        int64   `json:"userid"`
	PageID        int64   `json:"pageid"`
	RevID         int64   `json:"revid"`
	ParentID      int64   `json:"parentid"`
	NS            int     `json:"ns"`
	Title         string  `json:"title"`
	Timestamp     string  `json:"timestamp"`
	New           bool    `json:"new"`
	Minor         bool    `json:"minor"`
	Top           bool    `json:"top"`
	Comment       *string `json:"comment"`
	ParsedComment *string `json:"parsedcomment"`
}

type Contribs struct {
	Query struct {
		Usercontribs []Contrib `json:"usercontribs"`
	} `json:"query"`
}

type ECUser struct {
	Name      string `json:"name"`
	Userid    *int   `json:"userid"`
	Editcount *int   `json:"editcount"`
	Missing   *bool  `json:"missing"`
}

type ECQuery struct {
	Query struct {
		Users []ECUser `json:"users"`
	} `json:"query"`
}

func (client *Client) GetContribs(user string) ([]byte, error) {

	params := map[string]string{
		"action":        "query",
		"format":        "json",
		"list":          "usercontribs",
		"formatversion": "2",
		"ucuser":        user,
		"ucprop":        "ids|title|timestamp|comment|size|flags",
	}

	res, err := client.Get(params)
	if err != nil {
		return nil, err
	}

	data := &Contribs{}

	err = json.Unmarshal(res, data)
	if err != nil {
		return nil, err
	}

	contribs, err := json.Marshal(data.Query.Usercontribs)

	return contribs, nil
}

func (client *Client) GetLocalEditCounts(users []string) (map[string]int, error) {
	userString := strings.Join(users, "|")
	output := map[string]int{}

	params := map[string]string{
		"action":  "query",
		"list":    "users",
		"ususers": userString,
		"usprop":  "editcount",
	}

	res, err := client.Get(params)
	if err != nil {
		return nil, err
	}
	fmt.Println(string(res))

	data := &ECQuery{}

	err = json.Unmarshal(res, data)
	if err != nil {
		return nil, err
	}

	for _, item := range data.Query.Users {
		output[item.Name] = *item.Editcount
	}

	return output, nil
}
