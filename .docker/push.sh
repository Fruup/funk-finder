#!/bin/bash

if [ -z "$1" ]; then
	echo "Usage: $0 <package-name>..."
	exit 1
fi

# Push the docker images to the registry.
echo "$@" | tr " " "\n" | xargs -I % docker push ghcr.io/fruup/funk-finder-%:latest
