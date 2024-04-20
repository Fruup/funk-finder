/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_p4t7HFV` ON `posts` (`shortcode`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  collection.indexes = []

  return dao.saveCollection(collection)
})
