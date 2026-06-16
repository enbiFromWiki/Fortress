package util

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
)

type MediaWikiClient struct {
	UserAgent  string
	HTTPC      *http.Client
	DefaultURL string
}

func (client *MediaWikiClient) DoWithUA(req *http.Request) (*http.Response, error) {
	req.Header.Set("User-Agent", client.UserAgent)
	res, err := client.HTTPC.Do(req)
	if !IsOK(res) {
		return nil, errors.New(res.Status)
	}
	return res, err
}

func IsOK(res *http.Response) bool {
	return res.StatusCode >= 200 && res.StatusCode < 300
}

func NewClient(ua string, url string) *MediaWikiClient {
	return &MediaWikiClient{
		UserAgent:  ua,
		HTTPC:      http.DefaultClient,
		DefaultURL: url,
	}
}

var DefaultClient = &MediaWikiClient{
	UserAgent:  "User:enbi's OAuth test application in Golang",
	HTTPC:      http.DefaultClient,
	DefaultURL: "https://test.wikipedia.org/w/api.php",
}

func (client *MediaWikiClient) Get(params map[string]string, token string, serverOverride ...string) (map[string]any, error) {
	if len(serverOverride) > 1 {
		return nil, errors.New("Too many parameters.")
	}

	var stringUrl string

	if len(serverOverride) == 1 {
		stringUrl = serverOverride[0]
	} else {
		// no override given
		stringUrl = client.DefaultURL
	}

	parsedUrl, err := url.Parse(stringUrl)
	if err != nil {
		return nil, errors.New("Invalid URL.")
	}

	q := parsedUrl.Query()
	q.Add("format", "json")

	for key, val := range params {
		q.Add(key, val)
	}

	parsedUrl.RawQuery = q.Encode()

	req, _ := http.NewRequest("GET", parsedUrl.String(), nil)

	req.Header.Set("Authorization", "Bearer "+token)

	res, err := client.DoWithUA(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)
	var output map[string]any

	err = json.Unmarshal(bodyBytes, &output)
	if err != nil {
		return nil, err
	}

	return output, err
}
