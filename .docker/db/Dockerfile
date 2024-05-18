FROM alpine:latest as base

ARG PB_VERSION=0.22.11
# ARG PLATFORM=linux_arm64
ARG PLATFORM=linux_amd64

RUN apk add --no-cache \
  unzip \
  ca-certificates

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PLATFORM}.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# uncomment to copy the local pb_migrations dir into the image
# COPY ./pb_migrations /pb/pb_migrations

# uncomment to copy the local pb_hooks dir into the image
# COPY ./pb_hooks /pb/pb_hooks

ENV HOST=0.0.0.0

EXPOSE 8080

# start PocketBase
# HOST should be resolved at runtime, so IPv6 can be used in production.
CMD /pb/pocketbase serve --http=${HOST}:8080

# ----------------------------------------------

FROM base as dev

# ----------------------------------------------

FROM base as prod

ADD db/pb/pb_data/backups/init.zip /pb/pb_data/backups/
