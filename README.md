# Funk Finder

As a **USER** I want to type my query into a textbox and retrieve a list of **POSTS**.
When I click a **POST**, I want to get linked to the Instagram page of the post.

A **POST** has an ID, a caption and one or multiple **MEDIA**.
Each **MEDIUM** has text associated with it.

```ts
interface Medium {
  id: string
  text: string
}

interface Post {
  id: string
  caption: string
  media: Medium[] // JSON field
  status: "pending" | "ready"
}
```

## Flow

-> Instagram App Authorization
-> token generated
-> token used to retrieve posts
-> existing posts are filtered out
-> posts uploaded to database
-> OCR service takes unprocessed posts and generates text for each image, stores in db
