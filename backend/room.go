package main

import (
	"sync"

	uuid "github.com/satori/go.uuid"
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
	send    chan *Hand

	users map[uuid.UUID]*User
	hands map[uuid.UUID]*Hand
	conns map[uuid.UUID]*WSConnection
}

const minPriority = 0
const maxPriority = 4

func newRoom(secret string, storage *roomStorage) *Room {
	return &Room{
		secret:  secret,
		storage: storage,
		users:   make(map[uuid.UUID]*User),
		hands:   make(map[uuid.UUID]*Hand),
		conns:   make(map[uuid.UUID]*WSConnection),
	}
}

func (room *Room) find(userName string) *User {
	for _, user := range room.users {
		if user.name == userName {
			return user
		}
	}

	return nil
}

func (room *Room) broadcast(hand *Hand) {
	for _, conn := range room.conns {
		conn.broadcast(hand)
	}
}

func (room *Room) disconnect(conn *WSConnection) {
	room.mux.Lock()
	defer room.mux.Unlock()

	if conn.ws != nil {
		conn.ws.Close()
	}

	delete(room.conns, conn.ID)
}

func (room *Room) drop(hand *Hand) {
	hand.Cancel = true
	room.broadcast(hand)
	delete(room.hands, hand.ID)
}
