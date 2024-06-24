FROM --platform=$BUILDPLATFORM oven/bun:latest as dev

WORKDIR /work/web

CMD bun i && bun run dev

# ---------------------------------------

FROM --platform=$BUILDPLATFORM oven/bun:latest as builder

WORKDIR /work/web

# Install dependencies.
ADD web/package.json ./
ADD web/bun.lockb ./

ADD db/package.json ../db/

# RUN pnpm install
RUN bun install --no-save

# Copy sources.
ADD web/src ./src
ADD web/static ./static
ADD web/postcss.config.js ./
ADD web/svelte.config.js ./
ADD web/tailwind.config.js ./
ADD web/vite.config.ts ./
ADD web/tsconfig.json ./

ADD db/index.ts ../db/
ADD db/types ../db/types

ADD scraper/src/helpers ../scraper/src/helpers
ADD scraper/src/*.ts ../scraper/src/

# Build.
RUN bun run build

# ---------------------------------------

FROM oven/bun:latest as prod

WORKDIR /work

# Copy the built binary from the builder image.
COPY --from=builder /work/web/build .

# Copy the package.json and install production dependencies.
COPY --from=builder /work/web/package.json .
COPY --from=builder /work/web/bun.lockb .

RUN bun install --production
# Workaround???
RUN bun add --production --no-save set-cookie-parser cookie devalue @microsoft/fetch-event-source

ENTRYPOINT bun run .
