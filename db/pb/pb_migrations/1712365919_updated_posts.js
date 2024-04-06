/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jjgd5rbz",
    "name": "media",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "awvcscujoun91i0",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // remove
  collection.schema.removeField("jjgd5rbz")

  return dao.saveCollection(collection)
})
