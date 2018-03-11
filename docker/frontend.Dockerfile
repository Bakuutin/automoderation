FROM node:8.9.4

WORKDIR /usr/local/app
COPY ./frontend/package.json /usr/local/app/package.json
RUN npm install
COPY ./frontend /usr/local/app

CMD ["node_modules/.bin/gulp", "build"]
