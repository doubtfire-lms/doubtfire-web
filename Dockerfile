FROM noonat/ruby-node

RUN mkdir /doubtfire-web
WORKDIR /doubtfire-web

EXPOSE 4200

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

COPY . /doubtfire-web/

# In case of running docker without docker-compose. You should specify IP address of API by adding '--build-arg DF_DOCKER_MACHINE_IP=192.0.2.1' to 'docker build' command.
ARG DF_DOCKER_MACHINE_IP
# No need to run 'npm run build' because 'ng serve' includes 'ng build'
RUN grunt build
CMD npm start
