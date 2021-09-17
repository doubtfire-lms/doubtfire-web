FROM node:12

WORKDIR /doubtfire-web

EXPOSE 4200

ENV NODE_ENV docker

# Install packages within the container
COPY package.json /doubtfire-web/
RUN npm install

# CMD npm start
