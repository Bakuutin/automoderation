package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	raven "github.com/getsentry/raven-go"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
)

// RaiseHandRequest represents raise hand request format
type RaiseHandRequest struct {
	Priority uint8 `json:"priority"`
}

// ErrorResponse represents auth response format for dismissed user
type ErrorResponse struct {
	Error string `json:"error"`
}

// SetUser checks if user token is valid
func (storage *roomStorage) SetUser(f func(*User, http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		URLVars := mux.Vars(r)
		roomID := URLVars["roomID"]
		userName := URLVars["userName"]
		if roomID == "" || userName == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		room := storage.getOrCreateRoom(roomID)
		user := room.getOrCreateUser(userName)

		f(user, w, r)
	}
}

func serveWs(user *User, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error:", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user.connect(conn)
}

func raiseHand(user *User, w http.ResponseWriter, r *http.Request) {
	var handRequest RaiseHandRequest
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&handRequest)

	if err != nil || handRequest.Priority > maxPriority || handRequest.Priority < minPriority {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	newHand := NewHand(user, handRequest.Priority)

	user.room.mux.Lock()
	defer user.room.mux.Unlock()

	for _, hand := range user.room.hands {
		if hand.User == newHand.User && hand.Priority == newHand.Priority {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	user.room.hands[newHand.ID] = newHand
	user.room.broadcast(newHand)
	w.WriteHeader(http.StatusOK)
	w.Write(newHand.Bytes())
}

func dropHand(user *User, w http.ResponseWriter, r *http.Request) {
	URLVars := mux.Vars(r)

	handID, err := uuid.FromString(URLVars["handID"])
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	user.room.mux.Lock()
	defer user.room.mux.Unlock()

	for _, hand := range user.room.hands {
		if hand.User == user && hand.ID == handID {
			user.room.drop(hand)
			w.WriteHeader(http.StatusOK)
			w.Write(hand.Bytes())
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
}

func main() {
	storage := newRoomStorage()

	r := mux.NewRouter().StrictSlash(true)
	r.HandleFunc(`/`, func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "/data/static/index.html") }).Methods("GET")
	user := r.PathPrefix(`/api/rooms/{roomID}/users/{userName}`).Subrouter()
	user.HandleFunc(`/ws`, storage.SetUser(serveWs))
	hands := user.PathPrefix(`/hands`).Subrouter()
	hands.HandleFunc(`/`, storage.SetUser(raiseHand)).Methods("POST")
	hands.HandleFunc(`/{handID:[\-a-z0-9]{36}}`, storage.SetUser(dropHand)).Methods("DELETE")

	r.PathPrefix(`/static/`).Handler(http.StripPrefix(`/static/`, http.FileServer(http.Dir(`/data/static`))))

	raven.SetDSN(os.Getenv("SENTRY_DSN"))
	handler := http.HandlerFunc(raven.RecoveryHandler(r.ServeHTTP))
	err := http.ListenAndServe("0.0.0.0:80", handlers.LoggingHandler(os.Stdout, handler))
	if err != nil {
		fmt.Println("ListenAndServe:", err.Error())
	}
}
