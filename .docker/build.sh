#!/bin/bash

# Build the docker image.
docker compose -f docker-compose.production.yml build $1
