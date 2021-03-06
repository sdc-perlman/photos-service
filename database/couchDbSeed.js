require('dotenv').config();
const nano = require('nano')(`http://admin:${process.env.COUCHDB_PW}@localhost:5984`);
const DB_NAME = 'sdc-perlman-photos';
const NUM_RECORDS = 10000000;
/*
CouchDB uses databases that have documents. Each document is an item of data.
To think of the documents as different 'tables', use the type field.
Workspaces "collection":
  {
    type: 'workspace',
    _id: Integer workspace id, acts as foreign key for photos
  }
  {
    type: 'photo',
    url: String,
    description: String,
    workspaceId: Integer foreign key linking to the 'workspace' document
  }

*/

var idToStr = (id) => {
  idStr = id.toString();
  return '000000000'.slice(0, 9-idStr.length) + idStr;
}


(async  () => {
  var db;
  try {
    await nano.db.destroy(DB_NAME); //will work if database exists, otherwise will continue
  } finally {
    await nano.db.create(DB_NAME);
    db = nano.db.use(DB_NAME);
  }
  //Make 10M records
  for (var i = 0; i < NUM_RECORDS; i++) {
    await db.insert({type: 'workspace', _id: idToStr(i)});
  }
  console.log(`Done inserting ${NUM_RECORDS} records`);
})();

