FROM noonat/ruby-node

RUN mkdir /doubtfire-web
WORKDIR /doubtfire-web

EXPOSE 8000
EXPOSE 8080

ENV NODE_ENV docker

# Ruby required for SASS
RUN gem install sass

RUN npm install -g grunt-cli bower
RUN nodenv rehash

# To rebuild Docker image faster, copy dependency information files only
COPY .bowerrc bower.json /doubtfire-web/
RUN bower install --allow-root
COPY package.json package-lock.json /doubtfire-web/
RUN npm install

CMD npm start
