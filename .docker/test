#!/bin/bash

# start services
docker compose \
	-f docker-compose.production.yml \
	-f docker-compose.production-test.yml \
	up \
	web db chroma scraper-api
