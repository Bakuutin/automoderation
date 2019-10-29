FROM node:10

WORKDIR /usr/local/app
COPY ./frontend/package.json /usr/local/app/package.json
RUN npm install
COPY ./frontend /usr/local/app

CMD ["npm", "run", "build"]
