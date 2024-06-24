#!/bin/bash

# Build the docker image.
docker compose -f docker-compose.production.yml build --builder mybuilder --push $1
