package mediawiki

import (
	"encoding/json"
	"fmt"
	"regexp"
)

func (c *MediaWikiClient) GetSinglePageContent(title string, wiki string) (string, bool, error) {
	res, err := c.Get(map[string]string{
		"action":  "query",
		"prop":    "revisions",
		"titles":  title,
		"rvprop":  "content",
		"rvslots": "main",
	}, "none", "https://"+wiki+"/w/api.php")
	if err != nil {
		return "", false, err
	}

	var data ContentResponseJSON
	err = json.Unmarshal(res, &data)
	if err != nil {
		return "", false, err
	}

	content := data.Query.Pages[0].Revisions[0].Slots.Main.Content
	return content, content != "", nil
}

func (c *MediaWikiClient) Edit(page string, wiki string, tok string, content string, summary string, appendtext bool) error {
	tokByte, err := c.Get(map[string]string{
		"action": "query",
		"meta":   "tokens",
	}, tok, "https://"+wiki+"/w/api.php")
	if err != nil {
		fmt.Println(string(tokByte))
		return err
	}

	var tokJson CSRF
	json.Unmarshal(tokByte, &tokJson)

	csrf := tokJson.Query.Tokens.Csrftoken

	params := map[string]string{
		"action":  "edit",
		"title":   page,
		"summary": summary,
		"token":   csrf,
	}
	if appendtext {
		params["appendtext"] = content
	} else {
		params["text"] = content
	}

	_, err = c.Post(params, tok, "https://"+wiki+"/w/api.php")
	if err != nil {
		return err
	}
	return nil

}

func (c *MediaWikiClient) ReportToEnwikiAIV(user string, reason string, tok string) (bool, error) {
	aivPage := "Wikipedia:Administrator intervention against vandalism"
	content, exists, err := c.GetSinglePageContent(aivPage, "test.wikipedia.org")
	if err != nil {
		return false, err
	}
	if !exists {
		return false, nil
	}
	regex := regexp.MustCompile(`(?i)\{\{(?:ip)?vandal\|` + regexp.QuoteMeta(user) + `\}\}`)

	humanReportedSli := regexp.MustCompile(`(?m)^\s*=== ?User-reported ?===\s*$`).Split(content, -1)
	humanReported := ""
	if len(humanReportedSli) == 2 {
		humanReported = humanReportedSli[1]
	}

	if regex.MatchString(humanReported) {
		return false, nil
	}

	err = c.Edit(aivPage, "test.wikipedia.org", tok, "\n*{{vandal|"+user+"}} &ndash; "+reason+" ~~~~", "Reporting ([[m:Fortress|Fortress]])", true)
	if err != nil {
		return false, err
	}

	return true, nil
}
