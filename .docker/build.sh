#!/bin/bash

PACKAGE_NAME=$1

PLATFORM=linux/amd64 # Specify the platform. Most likely linux/amd64.
IMAGE_NAME=ghcr.io/fruup/funk-finder-${PACKAGE_NAME}:latest

docker build -t $IMAGE_NAME --platform ${PLATFORM} -f .docker/${PACKAGE_NAME}/Dockerfile . # Build the docker image.
