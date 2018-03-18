package main

import (
	"sync"

	"github.com/gorilla/websocket"
	"github.com/satori/go.uuid"
)

type roomStorage struct {
	rooms map[string]*Room
	users map[string]*User
	mux   sync.Mutex
}

func newRoomStorage() *roomStorage {
	return &roomStorage{
		rooms: make(map[string]*Room),
		users: make(map[string]*User),
	}
}

func (s *roomStorage) getOrCreateRoom(secret string) *Room {
	room, ok := s.rooms[secret]
	if !ok {
		room = newRoom(secret, s)
		s.rooms[secret] = room
	}
	return room
}

// Room maintains the set of active users and broadcasts messages to the users.
type Room struct {
	secret  string
	storage *roomStorage
	mux     sync.Mutex

	users map[uuid.UUID]*User
	hands map[uuid.UUID]*Hand
}

const minPriority = 0
const maxPriority = 4

func newRoom(secret string, storage *roomStorage) *Room {
	return &Room{
		secret:  secret,
		storage: storage,
		users:   make(map[uuid.UUID]*User),
		hands:   make(map[uuid.UUID]*Hand),
	}
}

func (room *Room) reserved(userName string) bool {
	for _, user := range room.users {
		if user.name == userName {
			return true
		}
	}

	return false
}

func (room *Room) broadcast(hand *Hand) {
	for _, user := range room.users {
		if user.conn == nil {
			continue
		}
		user.broadcast(hand)
	}
}

func (room *Room) connect(user *User, conn *websocket.Conn) {
	room.mux.Lock()
	defer room.mux.Unlock()

	user.conn = conn
	go user.runPing()
	room.users[user.id] = user
	for _, hand := range room.hands {
		user.broadcast(hand)
	}
}

func (room *Room) disconnect(user *User) {
	room.mux.Lock()
	defer room.mux.Unlock()

	if user.conn != nil {
		user.conn.Close()
		user.conn = nil
	}

	go user.dropAfterLongDiconnect()

	// TODO: Start self-destruct timer if all users are disconnected
}

func (room *Room) drop(hand *Hand) {
	hand.Cancel = true
	room.broadcast(hand)
	delete(room.hands, hand.ID)
}
