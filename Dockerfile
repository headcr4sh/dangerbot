FROM node:15.0.1 AS builder
COPY . /usr/local/src/dangerbot
WORKDIR /usr/local/src/dangerbot
RUN npm install
RUN chmod +x ./lib/main/server.js
RUN npm pack

FROM node:15.0.1
COPY --from=builder /usr/local/src/dangerbot/headcr4sh-dangerbot-*.tgz /tmp/dangerbot.tgz
RUN npm install --global /tmp/dangerbot.tgz

ENV DANGERBOT_DISCORD_TOKEN=

ENTRYPOINT ["/usr/local/bin/dangerbot"]
