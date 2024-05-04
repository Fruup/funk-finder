```sh
docker login ghcr.io # Login to the docker registry.
cd .. # Go to the root of the project.

PLATFORM=linux/amd64 # Specify the platform. Most likely linux/amd64.

PACKAGE_NAME=web
IMAGE_NAME=ghcr.io/fruup/funk-finder-${PACKAGE_NAME}:latest

docker build -t $IMAGE_NAME --platform ${PLATFORM} -f .docker/${PACKAGE_NAME}/Dockerfile . # Build the docker image.

docker push $IMAGE_NAME # Push the docker image to the registry.
```
