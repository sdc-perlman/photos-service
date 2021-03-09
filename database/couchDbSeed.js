require('dotenv').config();
const nano = require('nano')(`http://admin:${process.env.COUCHDB_PW}@localhost:5984`);
const DB_NAME = 'sdc-perlman-photos';
const NUM_RECORDS = 10000000;
const PARTITION_SIZE = 1000;
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
    await nano.db.create(DB_NAME, {partitioned: true});
    db = nano.db.use(DB_NAME);
  }
  //Make NUM_RECORDS records
  for (var i = 0; i < Math.floor(NUM_RECORDS/PARTITION_SIZE); i++) {
    //make an object to insert for this partition
    var bulk = [];
    for (var j = 0; j < PARTITION_SIZE; j++) {
      var partition = (i).toString();
      var idStr = `${partition}:${idToStr(j)}`;
      bulk.push({
        _id: idStr,
        type: 'workspace'
      });
    }
    try {
      const response = await db.bulk({ docs: bulk })
      //console.log(response);
      //await db.insert(bulk);
    } catch(err) {
      console.log(err);
    }
  }
  console.log(`Done inserting ${NUM_RECORDS} records`);
})();

