FROM node:4-onbuild

ADD . /doubtfire-web
WORKDIR /doubtfire-web

EXPOSE 8000
EXPOSE 35729

ENV NODE_ENV docker

RUN npm install
RUN npm install -g grunt-cli bower
RUN bower install --allow-root
