package wiki

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type Client struct {
	httpc         *http.Client
	defaultUrl    string
	userAgent     string
	format        string
	formatversion uint8
}

func New(ua string, url string, format string, fv uint8) *Client {
	agent := ""
	if len(ua) == 0 {
		agent = "User:enbi's test script built in Go"
	} else {
		agent = ua
	}

	return &Client{
		httpc:         &http.Client{},
		defaultUrl:    url,
		userAgent:     agent,
		format:        format,
		formatversion: fv,
	}
}

func (client *Client) Get(params map[string]string) ([]byte, error) {
	// params["assert"] = "user"
	// if user := client.User; len(user) != 0 {
	// 	params["assertuser"] = user
	// }
	params["format"] = "json"

	fmt.Println("Request sent")

	url := client.defaultUrl + "?" + MapToQueryParams(params)

	fmt.Println(url)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		panic(err)
	}

	if agent := client.userAgent; len(agent) != 0 {
		req.Header.Set("User-Agent", agent)
	} else {
		req.Header.Set("User-Agent", "User:enbi's test script")
	}

	fmt.Println(req.Header.Get("User-Agent"))

	req.Header.Set("User-Agent", "User:enbi's test script")

	resp, err := client.httpc.Do(req)

	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)

		return nil, fmt.Errorf(
			"API returned %d: %s",
			resp.StatusCode,
			string(body),
		)
	}

	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)

	if err != nil {
		return nil, err
	}

	return data, nil

}

// func New(userAgent string, defaultUrl *url.URL) *Client {

// }

func MapToQueryParams(params map[string]string) string {
	values := url.Values{}

	for k, v := range params {
		values.Set(k, v)
	}

	return values.Encode()
}
