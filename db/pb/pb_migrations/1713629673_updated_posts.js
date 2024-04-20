/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ckpj3ey0",
    "name": "time",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // remove
  collection.schema.removeField("ckpj3ey0")

  return dao.saveCollection(collection)
})
