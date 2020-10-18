package main

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/bsm/redislock"
	"github.com/go-redis/redis"
	"github.com/gorilla/securecookie"
	"github.com/jackc/pgx/v4"

	uuid "github.com/satori/go.uuid"
)

const (
	userNameMaxLen = 128
	roomNameMaxLen = 256
)

type requestParams struct {
	RoomName string
	UserName string
	TrackID  uuid.UUID

	RDB    *redis.Client
	DB     *pgx.Conn
	Locker *redislock.Client
}

func (p *requestParams) ChannelName() string {
	return strings.Join([]string{"hands_channel", p.RoomName}, "_")
}

func (p *requestParams) ConnCounterName() string {
	return strings.Join([]string{"connections", p.RoomName, p.UserName}, "_")
}

func getDB() (db *pgx.Conn) {
	conn, err := pgx.Connect(context.Background(), os.Getenv("POSTGRES_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connection to database: %v\n", err)
		os.Exit(1)
	}
	return conn
}

func getRedis() *redis.Client {
	redisDB, err := strconv.Atoi(os.Getenv("REDIS_DB"))
	client := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_URL"),
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       redisDB,
	})

	_, err = client.Ping().Result()

	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connection to redis: %v\n", err)
		os.Exit(1)
	}
	return client
}

func getSecure() *securecookie.SecureCookie {
	// Hash keys should be at least 32 bytes long
	var hashKey = []byte("aSoyR5vovxlF7yKAJXOVlactDB7kAjfl")

	// Block keys should be 16 bytes (AES-128) or 32 bytes (AES-256) long.
	// Shorter keys may weaken the encryption used.
	var blockKey = []byte("MeU6yn2tHPqtzj5S5Jw2uOwYVZ6yJCGw")
	return securecookie.New(hashKey, blockKey)
}
