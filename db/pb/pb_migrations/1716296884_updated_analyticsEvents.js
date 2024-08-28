/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("s9r6r93veur1zhm")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pmztfehu",
    "name": "sessionId",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("s9r6r93veur1zhm")

  // remove
  collection.schema.removeField("pmztfehu")

  return dao.saveCollection(collection)
})
