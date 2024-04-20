/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // remove
  collection.schema.removeField("xp8mtgjv")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xp8mtgjv",
    "name": "status",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "pending",
        "finished"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
