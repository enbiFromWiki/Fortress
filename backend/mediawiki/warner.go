package mediawiki

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type WarnResult int

const (
	Failed WarnResult = iota
	Warned
	Reported
	AlreadyGone // already reported
	NoAction
)

type CSRF struct {
	Query struct {
		Tokens struct {
			Csrftoken string `json:"csrftoken"`
		} `json:"tokens"`
	} `json:"query"`
}

type ContentResponseJSON struct {
	Query struct {
		Pages []struct {
			Missing   bool `json:"missing"`
			Revisions []struct {
				Slots struct {
					Main struct {
						Content string `json:"content"`
					} `json:"main"`
				} `json:"slots"`
			} `json:"revisions"`
		} `json:"pages"`
	} `json:"query"`
}

func (c *MediaWikiClient) AutoWarnUser(user string, template string, tok string, wiki string) (WarnResult, error) {
	talkPage := "User talk:" + user
	content, exists, err := c.GetSinglePageContent(talkPage, wiki)
	if err != nil {
		return Failed, err
	}
	warningLevel := 0
	if exists {
		warningLevel = GetWarningLevel(content)
	}

	warningLevel += 1

	if warningLevel > 4 {
		if wiki == "en.wikipedia.org" {
			ok, err := c.ReportToEnwikiAIV(user, "Vandalism past final warning", tok)
			if err != nil {
				return Failed, err
			}
			if !ok {
				return AlreadyGone, err
			}
			return Reported, err
		}
		return NoAction, err
	}

	tokByte, err := c.Get(map[string]string{
		"action": "query",
		"meta":   "tokens",
	}, tok, "https://"+wiki+"/w/api.php")
	if err != nil {
		fmt.Println(string(tokByte))
		return Failed, err
	}

	var tokJson CSRF
	json.Unmarshal(tokByte, &tokJson)

	csrf := tokJson.Query.Tokens.Csrftoken

	wlStr := ""
	switch warningLevel {
	case 0:
		wlStr = "0"
	case 1:
		wlStr = "1"
	case 2:
		wlStr = "2"
	case 3:
		wlStr = "3"
	case 4:
		wlStr = "4"
	case 5:
		wlStr = "4im"
	}

	fullTemplate := template + wlStr
	newContent := ConstructNewTalk(fullTemplate, content)

	_, err = c.Post(map[string]string{
		"action":  "edit",
		"format":  "json",
		"title":   talkPage,
		"text":    newContent,
		"summary": "Warning [[Special:Contributions/" + user + "|" + user + "]]: {{[[Template:" + fullTemplate + "|" + fullTemplate + "]]}} ([[m:Fortress|Fortress]])",
		"token":   csrf,
	}, tok, "https://"+wiki+"/w/api.php")
	if err != nil {
		return Failed, err
	}
	return Warned, nil

}

func ConstructNewTalk(template string, content string) string {
	currentMonth := time.Now().UTC().Month().String()
	currentYear := strconv.Itoa(time.Now().UTC().Year())
	headerDate := currentMonth + " " + currentYear

	tp := SplitTalkSections(content)

	lastHeaderIndex := -1

	for i := len(tp) - 1; i >= 0; i-- {
		if tp[i].Header == headerDate {
			lastHeaderIndex = i
			break
		}
	}
	if lastHeaderIndex == -1 {
		newContent := ""
		if len(tp) == 0 {
			newContent = content + "== " + headerDate + " ==\n\n{{subst:" + template + "}} ~~~~\n\n"
		} else {
			newContent = content + "\n\n== " + headerDate + " ==\n\n{{subst:" + template + "}} ~~~~\n\n"
		}
		fmt.Println("making new section")
		return newContent
	}

	oldContent := tp[lastHeaderIndex].Content

	newContent := oldContent + "\n\n{{subst:" + template + "}} ~~~~\n\n"
	tp[lastHeaderIndex].Content = newContent

	edit := MakeTalkPage(tp)
	return edit
}

func GetWarningLevel(content string) int {
	sections := SplitTalkSections(content)
	fmt.Println(len(sections))
	currentMonth := time.Now().UTC().Month().String()
	currentYear := strconv.Itoa(time.Now().UTC().Year())
	headerDate := currentMonth + " " + currentYear
	fmt.Println("...", headerDate)

	allWarnings := []int{}

	for _, section := range sections {
		if section.Header == headerDate {
			fmt.Println(section)
			allWarnings = append(allWarnings, parseBodyForWarnings(section.Content)...)
		}
	}

	if len(allWarnings) == 0 {
		return 0
	}

	max := allWarnings[0]
	for _, j := range allWarnings[1:] {
		if j > max {
			max = j
		}
	}
	return max
}

func parseBodyForWarnings(body string) []int {
	warnings := []int{}
	regex := regexp.MustCompile(`<!--\s*Template:(uw-.*?)\s*-->`)
	for _, match := range regex.FindAllStringSubmatch(body, -1) {
		template := match[1]
		fmt.Println(template)
		switch string(template[len(template)-1]) {
		case "1":
			warnings = append(warnings, 1)
		case "2":
			warnings = append(warnings, 2)
		case "3":
			warnings = append(warnings, 3)
		case "4":
			warnings = append(warnings, 4)
		case "m": // 4im warning
			if strings.HasSuffix(template, "4im") {
				warnings = append(warnings, 5)
			}
		}
	}

	return warnings
}

type TalkSection struct {
	Header  string
	Content string
}

func MakeTalkPage(sects []TalkSection) string {
	content := ""
	for _, sect := range sects {
		content = content + "== " + sect.Header + " ==\n\n" + sect.Content + "\n\n"
	}

	return regexp.MustCompile("\n{3,}").ReplaceAllString(content, "\n\n")
}

func SplitTalkSections(content string) []TalkSection {
	sects := []TalkSection{}
	lines := strings.Split(content, "\n")
	headerRegex := regexp.MustCompile(`^\s*==\s*(.*?)\s*==\s*$`)
	inSection := false
	cache := TalkSection{}
	for _, line := range lines {
		if submatch := headerRegex.FindStringSubmatch(line); submatch != nil {
			if inSection {
				sects = append(sects, cache)
			}
			cache = TalkSection{
				Header:  submatch[1],
				Content: "",
			}
			inSection = true
			continue
		}
		if inSection {
			cache.Content = cache.Content + "\n" + line
		}
	}

	if inSection {
		sects = append(sects, cache)
	}
	return sects
}
