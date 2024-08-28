/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("awvcscujoun91i0")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "6tjiklsf",
    "name": "excluded",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("awvcscujoun91i0")

  // remove
  collection.schema.removeField("6tjiklsf")

  return dao.saveCollection(collection)
})
