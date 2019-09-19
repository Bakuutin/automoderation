FROM golang

RUN go get github.com/pilu/fresh
COPY ./backend /go/src/automoderation
WORKDIR /go/src/automoderation
EXPOSE 80
CMD ["fresh"]
