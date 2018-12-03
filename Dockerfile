FROM ubuntu:cosmic
FROM nginx

# requirements
RUN apt-get update && \
    apt-get install -y curl gpg jq unzip

# AriaNg
ENV REPO_URL='https://api.github.com/repos/mayswind/AriaNg/releases'

RUN RELEASE_URL="$(curl -sSL "$REPO_URL" | jq -r '.[0].assets[0].browser_download_url')" && \
    curl -sSL -o '/usr/share/nginx/html/latest.zip' "$RELEASE_URL"

RUN unzip -oq '/usr/share/nginx/html/latest.zip' -d '/usr/share/nginx/html' && rm '/usr/share/nginx/html/latest.zip'

# Cleanup
RUN apt-get remove -y curl gpg jq unzip

