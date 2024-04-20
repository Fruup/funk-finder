/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // remove
  collection.schema.removeField("a581lc9c")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ymz581nj1eibh9k")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a581lc9c",
    "name": "url",
    "type": "url",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  return dao.saveCollection(collection)
})
