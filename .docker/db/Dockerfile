FROM alpine:latest as base

ARG PB_VERSION=0.22.13
ARG TARGETOS
ARG TARGETARCH

RUN apk add --no-cache \
  unzip \
  ca-certificates

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${TARGETOS}_${TARGETARCH}.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

ENV HOST=0.0.0.0

EXPOSE 8080

# start PocketBase
# HOST should be resolved at runtime, so IPv6 can be used in production.
CMD /pb/pocketbase serve --http=${HOST}:8080

# ----------------------------------------------

FROM base as dev

# ----------------------------------------------

FROM base as prod

# COPY db/pb/pb_migrations /pb/pb_migrations
# COPY db/pb/pb_hooks /pb/pb_hooks

ADD db/pb/pb_data/backups/init.zip /pb/pb_data/backups/
