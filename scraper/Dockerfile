FROM ubuntu:22.04 as base

RUN apt-get update

# Install shared dependencies.
RUN apt-get install libleptonica-dev -y
RUN apt-get install libarchive-dev libcurl4-openssl-dev -y

# ------------------------------------------------------

FROM base as build-tesseract

# Install compilers
ENV MY_CC clang++-15
RUN apt-get install $MY_CC -y

# Install dependencies
RUN apt-get install autoconf -y
RUN apt-get install libpango1.0-dev -y
RUN apt-get install cabextract -y
RUN apt-get install ninja-build -y
RUN apt-get install cmake -y
RUN apt-get install git -y

# Clone tesseract
RUN git clone https://github.com/tesseract-ocr/tesseract
RUN cd tesseract
WORKDIR /tesseract

# Build tesseract
RUN mkdir build
RUN mkdir inst
RUN cmake \
	-S . \
	-B build \
	-G Ninja \
	-DCMAKE_BUILD_TYPE=Release \
	-DOPENMP_BUILD=OFF \
	-DCMAKE_CXX_COMPILER=$MY_CC \
	-DCMAKE_INSTALL_PREFIX:PATH=inst

RUN cmake --build build --config Release --target install

# ------------------------------------------------------

FROM base as dev

# Install bun
RUN apt-get install curl unzip -y
RUN curl -fsSL https://bun.sh/install | bash

RUN apt-get install pip -y

# Copy over the tesseract binary.
COPY --from=build-tesseract /tesseract/build/bin/tesseract /usr/bin/
RUN tesseract --version

# Install instaloader
RUN pip install instaloader

# CMD bash
# CMD bun run src/main.ts
