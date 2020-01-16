FROM circleci/node:6.14-browsers AS builder
RUN sudo npm install -g gulp
WORKDIR /src
COPY . .
RUN sudo npm install && sudo gulp clean build

FROM node:12.14.1-stretch
WORKDIR /public
RUN npm install http-server -g
COPY --from=builder /src/dist .
EXPOSE 8080
ENTRYPOINT ["http-server", ".", "-p", "8080", "-a", "0.0.0.0"]
