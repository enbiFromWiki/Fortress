package wshandler

import (
	"fmt"
	"gateway/mediawiki"
	"net/http"
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
}

type Hub struct {
	Clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan any //struct
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
			broadcast:  make(chan any),
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
				if client.paused {
					continue
				}
				select {
				case client.Send <- message:

				default:
					delete(h.Clients, client)
					close(client.Send)
				}
			}
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

func (h *Hub) Broadcast(msg any) {
	h.broadcast <- msg
}
