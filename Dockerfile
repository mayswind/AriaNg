FROM node:latest
WORKDIR /srv/app
COPY . .

RUN npm i
RUN npm i -g gulp
