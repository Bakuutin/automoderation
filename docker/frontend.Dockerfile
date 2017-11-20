FROM node

COPY ./frontend /usr/local/app
WORKDIR /usr/local/app

RUN npm install
CMD ["node_modules/.bin/gulp", "build"]
