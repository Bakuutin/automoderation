package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/satori/go.uuid"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 20 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	readBufferSize  = 1024
	writeBufferSize = 1024

	dropHandTimeout = 5 * time.Second
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  readBufferSize,
	WriteBufferSize: writeBufferSize,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// User has websocket connection and the room.
type User struct {
	name  string
	token string
	room  *Room
	conn  *websocket.Conn
	send  chan *Hand
	id    uuid.UUID
}

func newUser(name, token string, room *Room) *User {
	return &User{
		name:  name,
		token: token,
		room:  room,
		send:  make(chan *Hand),
		id:    uuid.Must(uuid.NewV4()),
	}
}

// MarshalJSON represents user as a JSON string
func (user User) MarshalJSON() ([]byte, error) {
	return json.Marshal(user.name)
}

func (user *User) broadcast(hand *Hand) {
	user.conn.SetWriteDeadline(time.Now().Add(writeWait))

	w, err := user.conn.NextWriter(websocket.TextMessage)
	if err != nil {
		go user.room.disconnect(user)
		return
	}

	w.Write(hand.Bytes())

	if err = w.Close(); err != nil {
		go user.room.disconnect(user)
		return
	}
}

// runPing keeps websocket open.
func (user *User) runPing() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		user.room.disconnect(user)
	}()
	for {
		select {
		case <-ticker.C:
			if user.conn == nil {
				return
			}
			user.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := user.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

func (user *User) dropAfterLongDiconnect() {
	var handsToDrop []*Hand

	time.Sleep(dropHandTimeout)

	room := user.room

	room.storage.mux.Lock()
	defer room.storage.mux.Unlock()

	if _, ok := room.storage.users[user.token]; !ok {
		return
	}

	room.mux.Lock()
	defer room.mux.Unlock()

	if user.conn != nil {
		// User connected back
		return
	}

	for _, hand := range room.hands {
		if hand.User == user {
			handsToDrop = append(handsToDrop, hand)
		}
	}

	for _, hand := range handsToDrop {
		room.drop(hand)
	}

	delete(room.users, user.id)
	delete(room.storage.users, user.token)
}
