FROM noonat/ruby-node

ADD . /doubtfire-web
WORKDIR /doubtfire-web

EXPOSE 8000
EXPOSE 8080

ENV NODE_ENV docker

# Ruby required for SASS
RUN gem install sass

RUN npm install
RUN npm install -g grunt-cli
RUN nodenv rehash
