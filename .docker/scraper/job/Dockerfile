FROM ubuntu:22.04 as base

WORKDIR /work/scraper
RUN apt-get update
RUN apt-get install pip -y

# Install instaloader
RUN pip install instaloader==4.13.1

# Install bun
RUN apt-get install curl unzip -y
RUN curl -fsSL https://bun.sh/install | bash

# Install gcloud
RUN curl https://sdk.cloud.google.com | bash -s -- --disable-prompts
ENV PATH="${PATH}:/root/google-cloud-sdk/bin"
# "gcloud auth" called during runtime.

# ------------------------------------------------------

FROM base as prod

ENV NODE_ENV=production

# Install dependencies
ADD scraper/package.json scraper/bun.lockb ./
RUN /root/.bun/bin/bun install --production --no-save

# Add sources.
COPY scraper/src ./src

# Add entrypoint.
ADD .docker/scraper/job/entry.sh /usr/bin/docker-entry.sh
RUN chmod +x /usr/bin/docker-entry.sh
ADD .docker/scraper/job/job.sh /usr/bin/docker-job.sh
RUN chmod +x /usr/bin/docker-job.sh

CMD docker-entry.sh

# ------------------------------------------------------

FROM base as dev

CMD bash
