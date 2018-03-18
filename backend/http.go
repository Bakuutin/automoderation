package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/satori/go.uuid"

	raven "github.com/getsentry/raven-go"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/thanhpk/randstr"
)

// AuthRequest represents auth request format
type AuthRequest struct {
	RoomSecret string `json:"room"`
	UserName   string `json:"name"`
}

// RaiseHandRequest represents raise hand request format
type RaiseHandRequest struct {
	Priority uint8 `json:"priority"`
}

// TokenResponse represents auth response format for registered user
type TokenResponse struct {
	Token string `json:"token"`
}

// ErrorResponse represents auth response format for dismissed user
type ErrorResponse struct {
	Error string `json:"error"`
}

func (storage *roomStorage) serveAuth(w http.ResponseWriter, r *http.Request) {
	var authRequest AuthRequest
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&authRequest)

	if err != nil || authRequest.RoomSecret == "" || authRequest.UserName == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	storage.mux.Lock()
	defer storage.mux.Unlock()

	room := storage.getOrCreateRoom(authRequest.RoomSecret)

	room.mux.Lock()
	defer room.mux.Unlock()

	if room.reserved(authRequest.UserName) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "That name is already taken in the room, sorry"})
	}

	token := randstr.Hex(32)

	user := newUser(authRequest.UserName, token, room)
	room.users[user.id] = user
	storage.users[token] = user
	go user.dropAfterLongDiconnect()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(TokenResponse{Token: token})
}

// AskToken checks if user token is valid
func (storage *roomStorage) AskToken(f func(*User, http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		storage.mux.Lock()
		user, ok := storage.users[r.Header.Get("Token")]
		storage.mux.Unlock()
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		f(user, w, r)
	}
}

func (storage *roomStorage) serveWs(w http.ResponseWriter, r *http.Request) {
	user, ok := storage.users[r.URL.Query().Get("token")]
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error:", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user.room.connect(user, conn)
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
	r.HandleFunc(`/auth`, storage.serveAuth).Methods("POST")
	r.HandleFunc(`/ws`, storage.serveWs)

	hands := r.PathPrefix(`/api/hands`).Subrouter()
	hands.HandleFunc(`/`, storage.AskToken(raiseHand)).Methods("POST")
	hands.HandleFunc(`/{handID:[\-a-z0-9]{36}}`, storage.AskToken(dropHand)).Methods("DELETE")

	r.PathPrefix(`/static/`).Handler(http.StripPrefix(`/static/`, http.FileServer(http.Dir(`/data/static`))))

	raven.SetDSN(os.Getenv("SENTRY_DSN"))
	handler := http.HandlerFunc(raven.RecoveryHandler(r.ServeHTTP))
	err := http.ListenAndServe("0.0.0.0:80", handlers.LoggingHandler(os.Stdout, handler))
	if err != nil {
		fmt.Println("ListenAndServe:", err.Error())
	}
}
