FROM debian:stretch

ENV DEBIAN_FRONTEND noninteractive

# Install build dependencies. Note that python is required to build Node.
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    autoconf \
    bison \
    build-essential \
    ca-certificates \
    curl \
    git-core \
    libcurl4-openssl-dev \
    libffi-dev \
    libgdbm3 \
    libgdbm-dev \
    libreadline-dev \
    libncurses5-dev \
    libsqlite3-dev \
    libssl-dev \
    libxml2-dev \
    libxslt1-dev \
    libyaml-dev \
    python \
    sqlite3 \
    zlib1g-dev \
    software-properties-common

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -

RUN apt-get install nodejs

RUN node -v && npm -v

# Clone everything, and setup the path.
RUN git clone https://github.com/rbenv/rbenv.git /root/.rbenv && \
    git clone https://github.com/rbenv/ruby-build.git /root/.rbenv/plugins/ruby-build


ENV PATH /root/.rbenv/shims:/root/.rbenv/bin:$PATH

ARG RUBY_VERSION=2.5.1

ENV RUBY_VERSION=${RUBY_VERSION}

RUN rbenv install ${RUBY_VERSION}

RUN CONFIGURE_OPTS="--disable-install-doc" rbenv global ${RUBY_VERSION} && \
    gem install bundler

WORKDIR /doubtfire-web

EXPOSE 4200

ENV NODE_ENV docker

# Ruby required for SASS
RUN gem install sass

# To rebuild Docker image faster, copy dependency information files only
COPY package.json package-lock.json /doubtfire-web/

RUN npm install

CMD npm start
