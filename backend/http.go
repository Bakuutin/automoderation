package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/bsm/redislock"
	raven "github.com/getsentry/raven-go"
	"github.com/go-redis/redis"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/securecookie"
	"github.com/jackc/pgx/v4"

	uuid "github.com/satori/go.uuid"
)

const (
	trackingCookieName = "amdrid"
)

// RaiseHandRequest represents raise hand request format
type RaiseHandRequest struct {
	Priority uint8 `json:"priority"`
}

// ErrorResponse represents auth response format for dismissed user
type ErrorResponse struct {
	Error string `json:"error"`
}

type handlerFunc func(*requestParams, http.ResponseWriter, *http.Request)

func getRequestWrapper(
	rdb *redis.Client,
	db *pgx.Conn,
	locker *redislock.Client,
	secure *securecookie.SecureCookie,
) func(handlerFunc) http.HandlerFunc {
	return func(f handlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			var (
				err     error
				trackID uuid.UUID
			)

			URLVars := mux.Vars(r)
			RoomName := URLVars["roomID"]
			userName := URLVars["userName"]
			if RoomName == "" ||
				userName == "" ||
				len(userName) > userNameMaxLen ||
				len(RoomName) > roomNameMaxLen {

				w.WriteHeader(http.StatusBadRequest)
				return
			}

			trackID, err = getTrackID(secure, r)
			if err != nil {
				trackID, err = setNewTrackID(secure, db, w, r)
				if err != nil {
					log.Panicln(err)
				}
			}

			params := &requestParams{
				RoomName: RoomName,
				UserName: userName,
				TrackID:  trackID,

				RDB:    rdb,
				DB:     db,
				Locker: locker,
			}

			f(params, w, r)
		}
	}
}

func serveWs(p *requestParams, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		fmt.Println("Error:", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	go handleConnect(p, conn)
}

func raiseHand(p *requestParams, w http.ResponseWriter, r *http.Request) {
	var handRequest RaiseHandRequest
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&handRequest); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	now := time.Now()

	hand := &Hand{
		UserName: p.UserName,
		Priority: handRequest.Priority,
		ID:       uuid.Must(uuid.NewV4()),
		Cancel:   false,
		RaisedAt: now.UTC().UnixNano(),
	}

	if _, err := p.DB.Exec(
		context.Background(),
		`
		INSERT INTO hands (id, room_name, user_name, track_id, priority, date_raised)
		VALUES ($1, $2, $3, $4, $5, $6)
		`,
		hand.ID,
		p.RoomName,
		p.UserName,
		p.TrackID,
		hand.Priority,
		now,
	); err != nil {
		w.WriteHeader(http.StatusConflict)
		return
	}

	broadcastHand(p, hand)

	w.WriteHeader(http.StatusOK)
	w.Write(hand.Bytes())
}

func dropHand(p *requestParams, w http.ResponseWriter, r *http.Request) {
	URLVars := mux.Vars(r)
	handID, err := uuid.FromString(URLVars["handID"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var priority uint8
	if err = p.DB.QueryRow(
		context.Background(),
		`
		UPDATE hands SET date_lowered = $1
		WHERE id = $2 AND date_lowered IS NULL
		RETURNING priority;
		`,
		time.Now(),
		handID,
	).Scan(&priority); err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	hand := &Hand{
		UserName: p.UserName,
		Priority: priority,
		ID:       handID,
		Cancel:   true,
	}

	broadcastHand(p, hand)
	w.WriteHeader(http.StatusNoContent)
	w.Write(hand.Bytes())
}

func getTrackID(secure *securecookie.SecureCookie, r *http.Request) (value uuid.UUID, err error) {
	var s string
	if cookie, err := r.Cookie(trackingCookieName); err == nil {
		err = secure.Decode(trackingCookieName, cookie.Value, &s)
	}
	if s == "" {
		err = errors.New("Empty cookie value")
	}
	if err == nil {
		err = value.UnmarshalText([]byte(s))
	}

	return value, err
}

func setNewTrackID(secure *securecookie.SecureCookie, db *pgx.Conn, w http.ResponseWriter, r *http.Request) (value uuid.UUID, err error) {
	value = uuid.Must(uuid.NewV4())
	var encoded string
	if encoded, err = secure.Encode(trackingCookieName, value.String()); err == nil {
		cookie := &http.Cookie{
			Name:  trackingCookieName,
			Value: encoded,
			Path:  "/",
			Secure:   true,
			Secure:   false,
			HttpOnly: true,
			Expires:  time.Now().AddDate(2, 0, 2),
		}
		http.SetCookie(w, cookie)
	}
	if err != nil {
		return value, err
	}

	_, err = db.Exec(
		context.Background(),
		`INSERT INTO track_ids (id, date_created) VALUES ($1, $2)`,
		value,
		time.Now(),
	)
	return value, err
}

func serveIndex(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200) // Freeze header. Allows to set cookie
	http.ServeFile(w, r, "/data/static/index.html")
}

func main() {
	db := getDB()
	defer db.Close(context.Background())

	rdb := getRedis()
	defer rdb.Close()

	wrap := getRequestWrapper(
		rdb,
		db,
		redislock.New(rdb),
		getSecure(),
	)

	r := mux.NewRouter().StrictSlash(true)
	user := r.PathPrefix(`/api/rooms/{roomID}/users/{userName}`).Subrouter()
	user.HandleFunc(`/ws`, wrap(serveWs))
	hands := user.PathPrefix(`/hands`).Subrouter()
	hands.HandleFunc(`/`, wrap(raiseHand)).Methods("POST")
	hands.HandleFunc(`/{handID:[\-a-z0-9]{36}}`, wrap(dropHand)).Methods("DELETE")

	r.PathPrefix(`/static/`).Handler(http.StripPrefix(`/static/`, http.FileServer(http.Dir(`/data/static`))))
	r.PathPrefix(`/`).HandlerFunc(serveIndex).Methods("GET")

	raven.SetDSN(os.Getenv("SENTRY_DSN"))
	handler := http.HandlerFunc(raven.RecoveryHandler(r.ServeHTTP))

	err := http.ListenAndServe("0.0.0.0:80", handlers.LoggingHandler(os.Stdout, handler))
	if err != nil {
		fmt.Println("ListenAndServe:", err.Error())
	}
}
