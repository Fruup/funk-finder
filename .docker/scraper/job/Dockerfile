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

# Clone tesseract. (Use a specific commit to avoid breaking changes)
RUN git clone https://github.com/tesseract-ocr/tesseract
WORKDIR tesseract
RUN git reset --hard 5d5a633a5d7abfb155a605be90f8033f82e9744f

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

FROM base as base-2

WORKDIR /work/scraper
RUN apt-get update

RUN apt-get install pip -y

# Copy over the tesseract binary.
COPY --from=build-tesseract /tesseract/build/bin/tesseract /usr/bin/
RUN tesseract --version

# Install instaloader
RUN pip install instaloader

# Install bun
RUN apt-get install curl unzip -y
RUN curl -fsSL https://bun.sh/install | bash

# ------------------------------------------------------

FROM base-2 as prod

ENV NODE_ENV=production

# Install dependencies
ADD scraper/package.json scraper/bun.lockb ./
RUN /root/.bun/bin/bun install --production --no-save

# Add OCR data.
ADD scraper/tessdata ./tessdata

# Add sources.
COPY scraper/src ./src

# Add entrypoint.
ADD .docker/scraper/job/entry.sh /usr/bin/docker-entry.sh
RUN chmod +x /usr/bin/docker-entry.sh
ADD .docker/scraper/load-session.sh /usr/bin/load-session.sh
RUN chmod +x /usr/bin/load-session.sh

CMD docker-entry.sh

# ------------------------------------------------------

FROM base-2 as dev

CMD bash
