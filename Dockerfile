FROM node:12.13-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=dev

RUN npm install --only=prod

COPY . .

EXPOSE 8080

RUN npm start