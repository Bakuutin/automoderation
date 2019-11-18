FROM node:10

WORKDIR /usr/local/app
COPY ./frontend/package.json /usr/local/app/package.json
COPY ./frontend/package-lock.json /usr/local/app/package-lock.json
RUN npm ci
COPY ./frontend /usr/local/app

CMD ["npm", "run", "build"]
