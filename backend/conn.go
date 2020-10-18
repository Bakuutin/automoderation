package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Send pings to connection with this period.
	pingPeriod = 1 * time.Second

	readBufferSize  = 1024
	writeBufferSize = 1024

	dropHandTimeout = 30 * time.Second
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  readBufferSize,
	WriteBufferSize: writeBufferSize,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WSConnection handles connection
type WSConnection struct {
	ws *websocket.Conn
}

func handleConnect(p *requestParams, ws *websocket.Conn) {
	conn := &WSConnection{ws: ws}

	pubsub := p.RDB.Subscribe(p.ChannelName())
	_, err := pubsub.Receive()
	if err != nil {
		log.Panicln(err)
	}

	go broadcastCurrent(p, conn)

	p.RDB.Incr(p.ConnCounterName())

	ch := pubsub.Channel()

	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		pubsub.Close()

		p.RDB.Decr(p.ConnCounterName())
		deleteHandsIfNotConnectedSoon(p)
	}()

	for {
		select {
		case <-ticker.C:
			if err := conn.ping(); err != nil {
				return
			}
		case msg := <-ch:
			if err = conn.broadcast([]byte(msg.Payload)); err != nil {
				return
			}
		}
	}
}

func broadcastCurrent(p *requestParams, conn *WSConnection) {
	rows, err := p.DB.Query(
		context.Background(),
		`
		SELECT user_name, priority, id, date_raised
		FROM hands WHERE room_name = $1 AND date_lowered IS NULL
		`,
		p.RoomName,
	)

	if err != nil {
		log.Panicln(err)
	}

	defer rows.Close()

	for rows.Next() {
		values, err := rows.Values()

		hand := getHandFromRow(values)

		if err = conn.broadcast(hand.Bytes()); err != nil {
			return
		}
	}
}

func (conn *WSConnection) ping() error {
	if err := conn.ws.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
		return err
	}

	if err := conn.ws.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
		return err
	}

	return nil
}

func (conn *WSConnection) broadcast(payload []byte) error {
	if err := conn.ws.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
		return err
	}

	conn.ws.SetWriteDeadline(time.Now().Add(writeWait))

	if err := conn.ws.WriteMessage(websocket.TextMessage, payload); err != nil {
		return err
	}

	return nil
}

func deleteHandsIfNotConnectedSoon(p *requestParams) {
	time.Sleep(dropHandTimeout)

	if val, _ := p.RDB.Get(p.ConnCounterName()).Int(); val > 0 {
		return
	}

	rows, err := p.DB.Query(
		context.Background(),
		`
		SELECT user_name, priority, id, date_raised
		FROM hands WHERE room_name = $1 AND user_name = $2 AND date_lowered IS NULL
		`,
		p.RoomName,
		p.UserName,
	)

	if err != nil {
		log.Panicln(err)
	}

	defer rows.Close()

	for rows.Next() {
		values, err := rows.Values()

		if err != nil {
			log.Panicln(err)
		}

		hand := getHandFromRow(values)
		hand.Cancel = true

		broadcastHand(p, hand)
	}

	p.DB.Exec(
		context.Background(),
		`
		UPDATE hands SET date_lowered = $3
		WHERE room_name = $1 AND user_name = $2 AND date_lowered IS NULL
		`,
		p.RoomName,
		p.UserName,
		time.Now(),
	)
}
