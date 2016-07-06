FROM noonat/ruby-node

ADD . /doubtfire-web
WORKDIR /doubtfire-web

EXPOSE 8000
EXPOSE 35729

ENV NODE_ENV docker

# Ruby required for SASS
RUN gem install sass

RUN npm install
RUN npm install -g grunt-cli bower
RUN nodenv rehash
RUN bower install --allow-root
