FROM oven/bun:latest as builder

WORKDIR /work/web

# Install dependencies.
ADD web/package.json ./
ADD web/bun.lockb ./

ADD db/package.json ../db/

# RUN pnpm install
RUN bun install

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

# Build.
RUN bun run build

# ---------------------------------------

FROM oven/bun:latest as prod

WORKDIR /work

# Copy the built binary from the builder image.
COPY --from=builder /work/web/build .

ENTRYPOINT bun run .
