### STAGE 1: Build ###
FROM node:22 AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
  gettext-base \
  && rm -rf /var/lib/apt/lists/*

USER node

# Setup builder to create doubtfire-web
# Copy in doubtfire-web code
WORKDIR /doubtfire-web
COPY package.json package-lock.json ./
RUN npm ci --force --include=optional

COPY --chown=node:node . .
RUN chmod 777 src

ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_RELEASE
ARG SENTRY_DIST
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV SENTRY_DIST=$SENTRY_DIST
RUN envsubst '${SENTRY_DSN} ${SENTRY_RELEASE} ${SENTRY_DIST}' < src/environments/environment.prod.ts > src/environments/environment.prod.ts.tmp && mv src/environments/environment.prod.ts.tmp src/environments/environment.prod.ts

# Launch - build to dist folder
RUN npm run-script deploy:build2api


## STAGE 2: Host ###
FROM nginx:1.29.0-alpine

# Remove the default Nginx configuration file
RUN rm -v /etc/nginx/nginx.conf

# Copy a configuration file from the current directory
ADD nginx.conf /etc/nginx/

COPY --from=build /doubtfire-web/dist/browser /usr/share/nginx/html

# Expose ports
EXPOSE 80
