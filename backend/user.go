package main

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
	"github.com/satori/go.uuid"
	"github.com/thanhpk/randstr"
)

// User has websocket connection and the room.
type User struct {
	name  string
	room  *Room
	id    uuid.UUID
	token string
}

func newUser(name string, room *Room) *User {
	return &User{
		name:  name,
		room:  room,
		id:    uuid.Must(uuid.NewV4()),
		token: randstr.Hex(32),
	}
}

// MarshalJSON represents user as a JSON string
func (user User) MarshalJSON() ([]byte, error) {
	return json.Marshal(user.name)
}

func (user *User) hasConnections() bool {
	user.room.mux.Lock()
	defer user.room.mux.Unlock()

	for _, conn := range user.room.conns {
		if conn.user == user {
			return true
		}
	}

	return false
}

func (user *User) connect(ws *websocket.Conn) {
	user.room.mux.Lock()
	defer user.room.mux.Unlock()

	conn := &WSConnection{
		ID:   uuid.Must(uuid.NewV4()),
		user: user,
		ws:   ws,
		send: make(chan *Hand),
	}

	go conn.runPing()

	user.room.conns[conn.ID] = conn

	for _, hand := range user.room.hands {
		conn.broadcast(hand)
	}
}

func (user *User) drop() {
	user.room.mux.Lock()
	defer user.room.mux.Unlock()

	user.room.storage.mux.Lock()
	defer user.room.storage.mux.Unlock()

	var handsToDrop []*Hand

	for _, hand := range user.room.hands {
		if hand.User == user {
			handsToDrop = append(handsToDrop, hand)
		}
	}

	for _, hand := range handsToDrop {
		user.room.drop(hand)
	}

	delete(user.room.storage.users, user.token)
	delete(user.room.users, user.id)

}

func (user *User) dropIfNotConnectedSoon() {
	time.Sleep(dropHandTimeout)
	if user == nil {
		return
	}
	if !user.hasConnections() {
		user.drop()
	}
}
