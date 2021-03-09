require('dotenv').config();
const nano = require('nano')(`http://admin:${process.env.COUCHDB_PW}@localhost:5984`);
const DB_NAME = 'sdc-perlman-photos';
const NUM_RECORDS = 10000000;
const PARTITION_SIZE = 500;
const PHOTOS_PER_RECORD = 5;
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
      var workspaceId = i * PARTITION_SIZE + j;
      var workspaceIdStr = `${partition}:${idToStr(workspaceId)}`;
      //add document for this workspace
      bulk.push({
        _id: workspaceIdStr,
        type: 'workspace'
      });
      //add documents for this workspace's photos
      for (var k = 0; k < PHOTOS_PER_RECORD; k++) {
        var photoId = NUM_RECORDS + workspaceId * PHOTOS_PER_RECORD + k;
        bulk.push({
          _id: `${partition}:${idToStr(photoId)}`,
          type: 'photo',
          url: 'http://placekitten.com/200/300',
          description: 'lorem ipsum hipster',
          workspaceId: workspaceIdStr,
        })
      }
    }
    try {
      const response = await db.bulk({ docs: bulk })
      //console.log(response);
      //await db.insert(bulk);
    } catch(err) {
      console.log(err);
    }
  }
  console.log(`Done inserting ${NUM_RECORDS} records with ${PHOTOS_PER_RECORD} photos each (${NUM_RECORDS * PHOTOS_PER_RECORD} total)`);
})();

