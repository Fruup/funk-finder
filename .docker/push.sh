#!/bin/bash

PACKAGE_NAME=$1

IMAGE_NAME=ghcr.io/fruup/funk-finder-${PACKAGE_NAME}:latest

docker push $IMAGE_NAME # Push the docker image to the registry.
