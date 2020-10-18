FROM golang:1.15 as base

RUN go get github.com/pilu/fresh
COPY ./backend /go/src/automoderation
WORKDIR /go/src/automoderation
EXPOSE 80
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -ldflags '-w -s' -o /backend
CMD ["fresh"]

FROM scratch
COPY --from=base /backend /backend
ENTRYPOINT ["/backend"]
EXPOSE 80
