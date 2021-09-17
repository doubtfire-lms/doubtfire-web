FROM node:14

WORKDIR /doubtfire-web

EXPOSE 4200

ENV NODE_ENV docker

# Install packages within the container
COPY package*.json /doubtfire-web/
RUN npm ci

# CMD npm start
