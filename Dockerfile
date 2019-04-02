FROM noonat/ruby-node

RUN mkdir /doubtfire-web
WORKDIR /doubtfire-web

EXPOSE 4200

ENV NODE_ENV docker

# Ruby required for SASS
RUN gem install sass

RUN nodenv rehash

# To rebuild Docker image faster, copy dependency information files only
COPY package.json package-lock.json /doubtfire-web/
RUN npm install

CMD npm start
