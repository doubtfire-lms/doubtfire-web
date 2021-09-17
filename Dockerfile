FROM node:14-alpine

WORKDIR /doubtfire-web

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run deploy

# CMD npm start
