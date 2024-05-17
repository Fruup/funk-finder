FROM python as base

WORKDIR /work/scraper
EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

# Install dependencies.
ADD ./scraper/py/requirements.txt .
RUN pip install -r requirements.txt

# Add entrypoint.
ADD ./.docker/scraper/api/entry.sh /usr/bin/docker-entry.sh
RUN chmod +x /usr/bin/docker-entry.sh
ADD ./.docker/scraper/load-session.sh /usr/bin/
RUN chmod +x /usr/bin/load-session.sh

ENTRYPOINT docker-entry.sh
CMD []

# ------------------------------------------------------

FROM base as dev

ENV COMMAND=dev

# ------------------------------------------------------

FROM base as prod

# Copy sources.
ADD ./scraper/py/*.py py/
# `timestapms.ini` file will be generated.
# `state` file comes in through `SESSION` env variable.
