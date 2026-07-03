package wshandler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
)

var upgrader = ws.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	conn  *ws.Conn
	send  chan any //struct
	hub   *Hub
	token string
}

type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan any //struct
}

func New() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan any),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true

		case client := <-h.unregister:
			if _, exists := h.clients[client]; exists {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:

				default:
					delete(h.clients, client)
					close(client.send)
				}
			}
		}

	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		c.hub.broadcast <- msg
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for msg := range c.send {
		err := c.conn.WriteJSON(msg)
		if err != nil {
			break
		}
	}
}

func ServeWs(hub *Hub, c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	token, _ := c.Get("accessToken")
	expiry, _ := c.Get("tokenExpiry")

	client := &Client{
		conn:  conn,
		hub:   hub,
		send:  make(chan any),
		token: token.(string),
	}

	client.hub.register <- client

	time.AfterFunc(time.Until(expiry.(time.Time)), func() {
		deadline := time.Now().Add(time.Second)
		hub.unregister <- client
		client.conn.WriteControl(ws.CloseMessage, ws.FormatCloseMessage(ws.ClosePolicyViolation, "token expired"), deadline)
		client.conn.Close()
	})

	go client.writePump()
	go client.readPump()
}

func (h *Hub) Broadcast(msg any) {
	h.broadcast <- msg
}
