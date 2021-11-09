FROM node:14

ENV DEBIAN_FRONTEND noninteractive

WORKDIR /doubtfire-web

EXPOSE 4200

ENV NODE_ENV docker

# Install packages within the container
COPY package.json package-lock.json /doubtfire-web/
RUN npm ci

# Move the node modules out of the working directory.
# They can then be copied back and into the project on launch
RUN mv /doubtfire-web/node_modules /

# Launch - copy in the node modules (to volume linked with code) and then run npm start
CMD launch.sh
