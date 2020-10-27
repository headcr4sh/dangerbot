FROM docker.io/library/node:15.0.1 AS builder

RUN apt-get -y update
RUN apt-get -y install python make gcc g++

COPY . /usr/local/src/dangerbot
WORKDIR /usr/local/src/dangerbot
RUN npm install
RUN chmod +x ./lib/main/server.js
RUN npm pack

FROM docker.io/library/node:15.0.1
COPY --from=builder /usr/local/src/dangerbot/headcr4sh-dangerbot-*.tgz /tmp/dangerbot.tgz
RUN npm install --global /tmp/dangerbot.tgz

ENV DANGERBOT_DISCORD_TOKEN=
ENV DANGERBOT_EDDB_API_ENDPOINT=
ENV DANGERBOT_STORAGE_PATH=/usr/local/share/dangerbot

VOLUME ["/usr/local/share/dangerbot"]

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/dangerbot"]
