FROM lsiobase/alpine.nginx:3.9

ARG BUILD_DATE
ARG VERSION

LABEL build_version=""
LABEL maintainer=""

ARG ARIA2WEBUI_VERSION
ARG ARIA2_VERSION

ENV ARIA2WEBUI_VERSION 1.0.1
ENV ARIA2_VERSION 1.34.0-r1

RUN \
    apk add --no-cache tar curl openssl aria2=${ARIA2_VERSION} unzip && \
    mkdir -p /data/aria2c-webui /data/config && \
    curl -sSL https://github.com/mayswind/AriaNg/releases/download/${ARIA2WEBUI_VERSION}/AriaNg-${ARIA2WEBUI_VERSION}.zip -o /tmp/AriaNg-${ARIA2WEBUI_VERSION}.zip && \
    unzip /tmp/AriaNg-${ARIA2WEBUI_VERSION}.zip -d /data/aria2c-webui && \
    apk del tar curl unzip && \
    rm -rf /tmp/*

COPY root/ /

EXPOSE 4040

VOLUME ["/data/downloads/"]
