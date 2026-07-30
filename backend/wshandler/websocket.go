package wshandler

import (
	"fmt"
	"gateway/global"
	"gateway/mediawiki"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
)

var upgrader = ws.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WikiPage struct {
	Title string
	Wiki  string
}

type Client struct {
	conn         *ws.Conn
	Send         chan any //struct
	hub          *Hub
	token        string
	SeenPages    []WikiPage
	paused       bool
	MaxEditCount int
	Wikis        []string
	WatchedUsers map[string]bool
	WatchedPages map[WikiPage]bool
}

type PauseRequest struct {
	client *Client
	paused bool
}

type Hub struct {
	Clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan global.WrittenUpdate //struct
	pause      chan PauseRequest
}

type WebSocketService struct {
	MWClient *mediawiki.MediaWikiClient
	Hub      *Hub
}

func New(mwclient *mediawiki.MediaWikiClient) *WebSocketService {
	return &WebSocketService{
		Hub: &Hub{
			Clients:    make(map[*Client]bool),
			register:   make(chan *Client),
			unregister: make(chan *Client),
			broadcast:  make(chan global.WrittenUpdate),
			pause:      make(chan PauseRequest),
		},
		MWClient: mwclient,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.Clients[client] = true

		case client := <-h.unregister:
			if _, exists := h.Clients[client]; exists {
				delete(h.Clients, client)
				close(client.Send)
			}
		case message := <-h.broadcast:
			for client := range h.Clients {
				shouldBeSent, processedMessage := ProcessData(message, client)
				if !shouldBeSent {
					continue
				}
				select {
				case client.Send <- processedMessage:

				default:
					delete(h.Clients, client)
					close(client.Send)
				}
			}
		case message := <-h.pause:
			fmt.Println("pause request made")
			message.client.paused = message.paused
		}

	}
}

func (c *Client) readPump(mwclient *mediawiki.MediaWikiClient) {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		fmt.Printf("received frame: %s\n", msg)
		handleIncomingMessage(c, msg, mwclient)
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for msg := range c.Send {
		err := c.conn.WriteJSON(msg)
		if err != nil {
			break
		}
	}
}

func ServeWs(w *WebSocketService, c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	maxEditCount, _ := strconv.Atoi(c.Query("maxcount"))
	wikis := strings.Split(c.Query("wikis"), ",")

	token, _ := c.Get("accessToken")
	expiry, _ := c.Get("tokenExpiry")

	client := &Client{
		conn:         conn,
		hub:          w.Hub,
		Send:         make(chan any),
		token:        token.(string),
		SeenPages:    []WikiPage{},
		paused:       false,
		MaxEditCount: maxEditCount,
		Wikis:        wikis,
		WatchedUsers: map[string]bool{},
		WatchedPages: map[WikiPage]bool{},
	}

	client.hub.register <- client

	time.AfterFunc(time.Until(expiry.(time.Time)), func() {
		deadline := time.Now().Add(time.Second)
		w.Hub.unregister <- client
		client.conn.WriteControl(ws.CloseMessage, ws.FormatCloseMessage(ws.ClosePolicyViolation, "token expired"), deadline)
		client.conn.Close()
	})

	go client.writePump()
	go client.readPump(w.MWClient)
}

func (h *Hub) Pause(client *Client) {
	h.pause <- PauseRequest{client: client, paused: true}
}

func (h *Hub) Unpause(client *Client) {
	h.pause <- PauseRequest{client: client, paused: false}
}

func (h *Hub) Broadcast(msg global.WrittenUpdate) {
	h.broadcast <- msg
}

func ProcessData(d global.WrittenUpdate, client *Client) (bool, global.WrittenUpdate) {
	switch data := any(d).(type) {
	case global.RecentChange:
		if client.paused {
			return false, data
		}
		_, userWatched := client.WatchedUsers[data.User.Username]
		_, pageWatched := client.WatchedPages[WikiPage{
			Title: data.Title,
			Wiki:  data.Wiki,
		}]

		data.Watched = userWatched
		data.PageWatched = pageWatched

		if data.User.EditCount <= client.MaxEditCount && slices.Contains(client.Wikis, data.Wiki) {
			client.SeenPages = append(client.SeenPages, WikiPage{
				Title: data.Title,
				Wiki:  data.Wiki,
			})
			return true, data
		}
		if pageWatched || userWatched {
			client.SeenPages = append(client.SeenPages, WikiPage{
				Title: data.Title,
				Wiki:  data.Wiki,
			})
			if length := len(client.SeenPages); length > 200 {
				client.SeenPages = client.SeenPages[length-200:]
			}
			return true, data
		}
		return false, data
	case global.RevUpdate:
		return slices.Contains(client.SeenPages, WikiPage{
			Title: data.Page,
			Wiki:  data.Wiki,
		}), data
	case global.BlockUpdate:
		return true, data
	default:
		fmt.Println("No type found for event")
		fmt.Println(d)
		return false, d
	}
}
