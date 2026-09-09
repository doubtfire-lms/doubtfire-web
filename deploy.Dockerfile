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
ARG UPLOAD_SENTRY_SOURCEMAPS=false
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV SENTRY_DIST=$SENTRY_DIST
RUN envsubst '${SENTRY_DSN} ${SENTRY_RELEASE} ${SENTRY_DIST}' < src/environments/environment.prod.ts > src/environments/environment.prod.ts.tmp && mv src/environments/environment.prod.ts.tmp src/environments/environment.prod.ts

# Launch - build to dist folder
RUN --mount=type=secret,id=sentry_auth_token,uid=1000 \
  if [ "$UPLOAD_SENTRY_SOURCEMAPS" = "true" ]; then \
    npm run deploy:build2api:sourcemaps; \
    SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token)" npm run sentry:sourcemaps; \
    find dist/browser -name '*.map' -delete; \
    npx ngsw-config dist/browser ngsw-config.json /; \
  else \
    npm run-script deploy; \
  fi

# Bake this build's inline-script hashes into the CSP. Angular's importmap
# lists every chunk's integrity hash, so its own hash changes on each build and
# only the build knows it. envsubst is given an explicit variable list so
# nginx's own $csp_* variables are left alone.
RUN CSP_SCRIPT_HASHES="$(node scripts/csp-inline-script-hashes.mjs dist/browser/index.html)" \
  envsubst '${CSP_SCRIPT_HASHES}' < nginx.conf > nginx.conf.built


## STAGE 2: Host ###
FROM nginx:1.29.0-alpine

# Remove the default Nginx configuration file
RUN rm -v /etc/nginx/nginx.conf

# Copy a configuration file from the current directory
COPY --from=build /doubtfire-web/nginx.conf.built /etc/nginx/nginx.conf

COPY --from=build /doubtfire-web/dist/browser /usr/share/nginx/html

# Expose ports
EXPOSE 80
