FROM birkhofflee/docker-simple-web-server:latest

WORKDIR /root

ADD . /root

RUN npm install -g bower && \
    npm install && \
    bower install && \
    gulp clean build && \
    cp -rv ./dist/* /app/src/public

WORKDIR /app
EXPOSE 80

CMD ["node", "src/index.js"]
