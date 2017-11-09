// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	maxMessageSize  = 512
	readBufferSize  = 1024
	writeBufferSize = 1024
)

var (
	newline = []byte{'\n'}
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
	name string
	room *Room
	conn *websocket.Conn
	send chan []byte // Buffered channel of outbound bytes.
}

func newUser(name string, room *Room) *User {
	return &User{
		name: name,
		room: room,
		send: make(chan []byte, maxMessageSize),
	}
}

func (user *User) broadcast(b *BroadcatedMessage) {
	user.send <- b.getBytes()
}

func (user *User) connect(conn *websocket.Conn) {
	user.conn = conn

	go user.writePump()
	go user.readPump()

	user.room.register <- user
}

type roomStorage struct {
	rooms map[string]*Room
	users map[string]*User
}

func newRoomStorage() *roomStorage {
	return &roomStorage{
		rooms: make(map[string]*Room),
		users: make(map[string]*User),
	}
}

func (s *roomStorage) getOrCreateRoom(name string) *Room {
	room, ok := s.rooms[name]
	if !ok {
		room = newRoom(name)
		s.rooms[name] = room
	}
	return room
}

// Message contains the data from user
type Message struct {
	Priority uint8 `json:"priority"`
	Cancel   bool  `json:"cancel"`
}

func processMessage(user *User, bytesFromUser []byte) {
	var (
		message    Message
		hasChanged bool
	)

	err := json.Unmarshal(bytesFromUser, &message)
	if err != nil {
		fmt.Println("Error:", err.Error())
		return
	}

	user.room.mux.Lock()
	defer user.room.mux.Unlock()

	var action func(*User, uint8) bool

	if !message.Cancel {
		action = user.room.add
	} else {
		action = user.room.remove
	}

	hasChanged = action(user, message.Priority)
	if hasChanged {
		user.room.broadcast(&BroadcatedMessage{
			Username: user.name,
			Priority: message.Priority,
			Cancel:   message.Cancel,
		})
	}

}

// readPump pumps messages from the websocket connection to the room.
func (user *User) readPump() {
	defer func() {
		user.room.unregister <- user
		user.conn.Close()
	}()
	user.conn.SetReadLimit(maxMessageSize)
	user.conn.SetReadDeadline(time.Now().Add(pongWait))
	user.conn.SetPongHandler(func(string) error { user.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, bytesFromUser, err := user.conn.ReadMessage()
		if err != nil {
			fmt.Println("Error:", err.Error())
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				return
			}
		}

		processMessage(user, bytesFromUser)
	}
}

// writePump pumps messages from the room to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (user *User) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		user.room.unregister <- user
		user.conn.Close()
	}()
	for {
		select {
		case message, ok := <-user.send:
			user.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The room closed the channel.
				user.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := user.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			user.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := user.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}
