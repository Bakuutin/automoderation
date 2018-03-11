FROM golang

RUN go get \
    github.com/gorilla/handlers \
    github.com/gorilla/mux \
    github.com/thanhpk/randstr \
    github.com/gorilla/websocket \
    github.com/satori/go.uuid \
    github.com/getsentry/raven-go

COPY ./backend /go/src/automoderation
WORKDIR /go/src/automoderation
EXPOSE 80
CMD ["bash", "run.sh"]
