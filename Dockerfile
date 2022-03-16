FROM node:16

ENV DEBIAN_FRONTEND noninteractive
ENV USER=node
ENV NODE_ENV docker

# You can not use `${USER}` here, but reference `/home/node`.
ENV PATH="/home/node/.npm-global/bin:${PATH}"
# 👉 The `--global` install dir
ENV NPM_CONFIG_PREFIX="/home/node/.npm-global"

EXPOSE 4200

USER "${USER}"

# Pre-create the target dir for global install.
RUN mkdir -p "${NPM_CONFIG_PREFIX}/lib"

WORKDIR /doubtfire-web

# Install global packages
RUN npm --global config set user "${USER}"

# Copy in resources
COPY --chown="${USER}":root . .

# Setup within container
RUN npm install

# Launch - install on launch so that node_modules are updated in volume
CMD /bin/bash -c 'npm install; npm start'
