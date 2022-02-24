### STAGE 1: Build ###
FROM lmsdoubtfire/doubtfire-web:6.0.x-dev AS build

USER node

# Setup builder to create doubtfire-web
# Copy in doubtfire-web code
WORKDIR /doubtfire-web
COPY package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .
RUN chmod 777 src

# Launch - build to dist folder
RUN npm run-script deploy


## STAGE 2: Host ###
FROM nginx:1.21.5-alpine

# Remove the default Nginx configuration file
RUN rm -v /etc/nginx/nginx.conf

# Copy a configuration file from the current directory
ADD nginx.conf /etc/nginx/

COPY --from=build /doubtfire-web/dist /usr/share/nginx/html

# Expose ports
EXPOSE 80
