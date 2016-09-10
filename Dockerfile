FROM node:6.3.1

ADD . /doubtfire-web
WORKDIR /doubtfire-web

EXPOSE 8000
EXPOSE 8080

ENV NODE_ENV docker

RUN npm install --unsafe-perm
