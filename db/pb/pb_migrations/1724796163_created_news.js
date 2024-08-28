/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "akv4ii6e343rar3",
    "created": "2024-08-27 22:02:43.145Z",
    "updated": "2024-08-27 22:02:43.145Z",
    "name": "news",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "adf8gbkn",
        "name": "heading",
        "type": "text",
        "required": true,
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
        "id": "q4qobhsw",
        "name": "severity",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "info",
            "warn",
            "alert"
          ]
        }
      },
      {
        "system": false,
        "id": "e9puw265",
        "name": "body",
        "type": "editor",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
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
  const collection = dao.findCollectionByNameOrId("akv4ii6e343rar3");

  return dao.deleteCollection(collection);
})
