package mediawiki

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type MediaWikiClient struct {
	UserAgent string
	HTTPC     *http.Client
}

func (client *MediaWikiClient) DoWithUA(req *http.Request) (*http.Response, error) {
	req.Header.Set("User-Agent", client.UserAgent)
	start := time.Now()
	res, err := client.HTTPC.Do(req)
	t := time.Now()
	timeTaken := t.Sub(start)
	fmt.Println(timeTaken)
	if err != nil {
		return nil, err
	}
	if !IsOK(res) {
		return nil, errors.New(res.Status)
	}
	return res, err
}

func IsOK(res *http.Response) bool {
	if res.StatusCode >= 200 && res.StatusCode < 300 {
		return true
	} else {
		return false
	}
}

func New(ua string, url string) *MediaWikiClient {
	return &MediaWikiClient{
		UserAgent: ua,
		HTTPC:     http.DefaultClient,
	}
}

func (client *MediaWikiClient) Get(params map[string]string, token string, serverOverride string) ([]byte, error) {
	stringUrl := serverOverride
	if !(strings.HasPrefix(stringUrl, "https://") && strings.HasSuffix(stringUrl, "/w/api.php")) {
		stringUrl = "https://" + stringUrl + "/w/api.php"
	}

	parsedUrl, err := url.Parse(stringUrl)
	if err != nil {
		return nil, errors.New("Invalid URL.")
	}

	q := parsedUrl.Query()
	q.Add("format", "json")
	q.Add("formatversion", "2")

	for key, val := range params {
		q.Add(key, val)
	}

	parsedUrl.RawQuery = q.Encode()

	fmt.Println("URL: " + parsedUrl.String())

	req, _ := http.NewRequest("GET", parsedUrl.String(), nil)

	if token != "none" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	res, err := client.DoWithUA(req)
	if err != nil {
		return nil, err
	}

	if apiError := res.Header.Get("Mediawiki-Api-Error"); apiError != "" {
		return nil, errors.New(apiError)
	}

	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)

	return bodyBytes, err
}

func (client *MediaWikiClient) Post(params map[string]string, token string, serverOverride string) ([]byte, error) {
	serverUrl := serverOverride
	if !(strings.HasPrefix(serverUrl, "https://") && strings.HasSuffix(serverUrl, "/w/api.php")) {
		serverUrl = "https://" + serverUrl + "/w/api.php"
	}

	q := url.Values{}

	q.Add("format", "json")
	q.Add("formatversion", "2")

	for key, val := range params {
		if key == "action" {
			serverUrl += "?action=" + val
			continue
		}
		q.Add(key, val)
	}

	fmt.Println(q.Encode())

	req, _ := http.NewRequest("POST", serverUrl, strings.NewReader(q.Encode()))

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", "Bearer "+token)

	res, err := client.DoWithUA(req)
	if err != nil {
		return nil, err
	}

	if apiError := res.Header.Get("Mediawiki-Api-Error"); apiError != "" {
		return nil, errors.New(apiError)
	}

	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)

	return bodyBytes, err
}
