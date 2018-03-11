package main

import (
	"encoding/json"
	"time"

	"github.com/satori/go.uuid"
)

// Hand represents the data broadcasted to users
type Hand struct {
	User     *User     `json:"user"`
	Priority uint8     `json:"priority"`
	ID       uuid.UUID `json:"id"`
	Cancel   bool      `json:"cancel,omitempty"`
	RaisedAt int64     `json:"raised_at"`
}

// Bytes returns bytes representation of a Hand
func (hand *Hand) Bytes() []byte {
	bytes, _ := json.Marshal(hand)
	return bytes
}

// NewHand creates a hand
func NewHand(user *User, priority uint8) *Hand {
	return &Hand{
		Priority: priority,
		User:     user,
		ID:       uuid.Must(uuid.NewV4()),
		RaisedAt: time.Now().Unix(),
	}
}
