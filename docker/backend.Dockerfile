FROM golang

RUN go get github.com/gorilla/handlers
RUN go get github.com/gorilla/mux
RUN go get github.com/thanhpk/randstr
RUN go get github.com/gorilla/websocket

COPY ./backend /go/src/talkqueue
WORKDIR /go/src/talkqueue

CMD ["go", "run", "http.go", "room.go", "user.go"]
