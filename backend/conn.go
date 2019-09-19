package main

import (
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	uuid "github.com/satori/go.uuid"
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

// WSConnection handles connection to room
type WSConnection struct {
	ID   uuid.UUID
	user *User
	ws   *websocket.Conn
	send chan *Hand
}

func (conn *WSConnection) broadcast(hand *Hand) {
	conn.ws.SetWriteDeadline(time.Now().Add(writeWait))

	w, err := conn.ws.NextWriter(websocket.TextMessage)
	if err != nil {
		go conn.user.room.disconnect(conn)
		return
	}

	w.Write(hand.Bytes())

	if err = w.Close(); err != nil {
		go conn.user.room.disconnect(conn)
		return
	}
}

// runPing keeps websocket open.
func (conn *WSConnection) runPing() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		conn.user.room.disconnect(conn)
		conn.user.dropIfNotConnectedSoon()
	}()
	for {
		select {
		case <-ticker.C:
			if conn.ws == nil {
				return
			}

			if err := conn.ws.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
				return
			}

			if err := conn.ws.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}
