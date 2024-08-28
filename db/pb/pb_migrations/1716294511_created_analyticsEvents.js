/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "s9r6r93veur1zhm",
    "created": "2024-05-21 12:28:31.941Z",
    "updated": "2024-05-21 12:28:31.941Z",
    "name": "analyticsEvents",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "bfhmtsji",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "y1ygvr1r",
        "name": "payload",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("s9r6r93veur1zhm");

  return dao.deleteCollection(collection);
})
