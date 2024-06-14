# Funk Finder

## TODO

- [ ] Frontend
  - [ ] design
  - [ ] disclaimer
  - [ ] footer (GH link, imprint)
- [ ] Backend
  - [ ] deployment
  - [ ] when to update?
  - [ ] filter out irrelevant media

## Ideas

- [x] Chroma DB
- [ ] Request further images for the same request (cache query embedding)
  - ChromaDB `get` exposes paging functionality
- [ ] Cache query embeddings in DB (Redis/PB?)
- [ ] Info page

## Build Docker images

`docker build --target prod --file ./web/Dockerfile -t fruup/funk-finder:web .`

- OrbStack multi-platform builds: https://docs.orbstack.dev/docker/images
