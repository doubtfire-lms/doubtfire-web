FROM node:14

ENV DEBIAN_FRONTEND noninteractive

WORKDIR /doubtfire-web

EXPOSE 4200

ENV NODE_ENV docker

# Install packages within the container
COPY package.json package-lock.json /doubtfire-web/
RUN npm install

CMD npm start
