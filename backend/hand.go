package main

import (
	"encoding/json"
	"log"
	"time"

	uuid "github.com/satori/go.uuid"
)

// Hand represents the data broadcasted to users
type Hand struct {
	UserName string    `json:"user"`
	Priority uint8     `json:"priority"`
	ID       uuid.UUID `json:"id"`
	Cancel   bool      `json:"cancel,omitempty"`
	RaisedAt int64     `json:"raisedAt"`
}

// Bytes returns bytes representation of a Hand
func (hand *Hand) Bytes() []byte {
	bytes, _ := json.Marshal(hand)
	return bytes
}

func getHandFromRow(values []interface{}) *Hand {
	priority := uint8(values[1].(int16))
	userName := values[0].(string)
	idBytes := values[2].([16]uint8)
	id := uuid.FromBytesOrNil(idBytes[:])
	raisedAt := values[3].(time.Time)

	return &Hand{
		UserName: userName,
		Priority: priority,
		ID:       id,
		RaisedAt: raisedAt.UTC().UnixNano(),
	}
}

func broadcastHand(p *requestParams, h *Hand) {
	err := p.RDB.Publish(p.ChannelName(), h.Bytes()).Err()
	if err != nil {
		log.Panicln(err)
	}
}
