FROM node:14-alpine

WORKDIR /doubtfire-web

COPY package*.json ./

RUN npm ci

COPY . .

# Install packages within the container
COPY package.json package-lock.json /doubtfire-web/
RUN npm ci

# CMD npm start
