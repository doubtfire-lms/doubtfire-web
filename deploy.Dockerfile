### STAGE 1: Build ###
FROM node:22 AS build

USER node

# Setup builder to create doubtfire-web
# Copy in doubtfire-web code
WORKDIR /doubtfire-web
COPY package.json package-lock.json ./
RUN npm ci --force --include=optional

COPY --chown=node:node . .
RUN chmod 777 src

# Launch - build to dist folder
RUN npm run-script deploy


## STAGE 2: Host ###
FROM nginx:1.29.0-alpine

# Remove the default Nginx configuration file
RUN rm -v /etc/nginx/nginx.conf

# Copy a configuration file from the current directory
ADD nginx.conf /etc/nginx/

COPY --from=build /doubtfire-web/dist/browser /usr/share/nginx/html

# Expose ports
EXPOSE 80
