# Funk Finder 🔍

> 💡 A web-app for searching Instagram posts by [@funk](https://instagram.com/funk) through free text!

[![Screenshot of the application](https://github.com/Fruup/funk-finder/assets/55341374/3d516bf2-05c2-41d6-b937-0da0e6ead60e)](https://funk-finder.de)

## TODO

- [x] Frontend
  - [x] design
  - [x] disclaimer
  - [x] footer (GH link, imprint)
- [x] Backend
  - [x] deployment
  - [x] when to update?

## Ideas

- [x] Chroma DB
- [x] Info page
- [ ] Request further images for the same request (cache query embedding)
  - ChromaDB `get` exposes paging functionality
- [ ] Cache query embeddings in DB (Redis/PB?)
- [ ] Filter out irrelevant media

## Build Docker images

Use `.docker/build`.
