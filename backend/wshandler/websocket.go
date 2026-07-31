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

type Filters struct {
	MaxEditCount int
	Wikis        []string
}

type Client struct {
	conn         *ws.Conn
	Send         chan any //struct
	hub          *Hub
	token        string
	SeenPages    []WikiPage
	paused       bool
	watchedUsers map[string]bool
	watchedPages map[WikiPage]bool
	filters      Filters
}

type PauseRequest struct {
	client *Client
	paused bool
}

type WatchUserRequest struct {
	client *Client
	watch  bool
	user   string
}

type WatchPageRequest struct {
	client *Client
	page   WikiPage
	watch  bool
}

type FilterChangeRequest struct {
	client  *Client
	filters Filters
}

type Hub struct {
	clients      map[*Client]bool
	register     chan *Client
	unregister   chan *Client
	broadcast    chan global.WrittenUpdate //struct
	pause        chan PauseRequest
	watchUser    chan WatchUserRequest
	watchPage    chan WatchPageRequest
	changeFilter chan FilterChangeRequest
}

type WebSocketService struct {
	MWClient *mediawiki.MediaWikiClient
	Hub      *Hub
}

func New(mwclient *mediawiki.MediaWikiClient) *WebSocketService {
	return &WebSocketService{
		Hub: &Hub{
			clients:    make(map[*Client]bool),
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
			h.clients[client] = true

		case client := <-h.unregister:
			if _, exists := h.clients[client]; exists {
				delete(h.clients, client)
				close(client.Send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				shouldBeSent, processedMessage := ProcessData(message, client)
				if !shouldBeSent {
					continue
				}
				select {
				case client.Send <- processedMessage:

				default:
					delete(h.clients, client)
					close(client.Send)
				}
			}
		case message := <-h.pause:
			fmt.Println("pause request made")
			message.client.paused = message.paused
		case message := <-h.watchUser:
			if message.watch {
				message.client.watchedUsers[message.user] = true
			} else {
				delete(message.client.watchedUsers, message.user)
			}
		case message := <-h.watchPage:
			if message.watch {
				message.client.watchedPages[message.page] = true
			} else {
				delete(message.client.watchedPages, message.page)
			}
		case message := <-h.changeFilter:
			message.client.filters = message.filters
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
		conn:      conn,
		hub:       w.Hub,
		Send:      make(chan any),
		token:     token.(string),
		SeenPages: []WikiPage{},
		paused:    false,
		filters: Filters{
			MaxEditCount: maxEditCount,
			Wikis:        wikis,
		},
		watchedUsers: map[string]bool{},
		watchedPages: map[WikiPage]bool{},
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

func (h *Hub) setWatchedUser(user string, client *Client, watch bool) {
	h.watchUser <- WatchUserRequest{
		client: client,
		watch:  watch,
		user:   user,
	}
}

func (h *Hub) setWatchedPage(title string, wiki string, client *Client, watch bool) {
	h.watchPage <- WatchPageRequest{
		client: client,
		watch:  watch,
		page: WikiPage{
			Title: title,
			Wiki:  wiki,
		},
	}
}

func (h *Hub) setFilters(editcount int, wikis []string, client *Client) {
	h.changeFilter <- FilterChangeRequest{
		client: client,
		filters: Filters{
			MaxEditCount: editcount,
			Wikis:        wikis,
		},
	}
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
		_, userWatched := client.watchedUsers[data.User.Username]
		_, pageWatched := client.watchedPages[WikiPage{
			Title: data.Title,
			Wiki:  data.Wiki,
		}]

		data.Watched = userWatched
		data.PageWatched = pageWatched

		if (data.User.EditCount <= client.filters.MaxEditCount && slices.Contains(client.filters.Wikis, data.Wiki)) || data.Wiki == "testwiki" {
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
