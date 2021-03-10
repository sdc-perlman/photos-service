var fs = require('fs').promises;
const NUM_RECORDS = 10000000;
const PARTITION_SIZE = 1000;
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

var objToStr = (obj) => {
  var str = "{";
  for (var i in obj) {
    str += `"${i.toString()}":"${obj[i].toString()}",`;
  }
  str = str.slice(0, -1);
  str += "},"
  return str;
}

var idToStr = (id) => {
  idStr = id.toString();
  return '000000000'.slice(0, 9-idStr.length) + idStr;
}

(async  () => {
  //Make NUM_RECORDS records
  for (var i = 0; i < Math.floor(NUM_RECORDS/PARTITION_SIZE); i++) {
    //make an object to insert for this partition
    var bulk = [];
    var bulkStr = "{ \"docs\": ["
    for (var j = 0; j < PARTITION_SIZE; j++) {
      var partition = (i).toString();
      var workspaceId = i * PARTITION_SIZE + j;
      var workspaceIdStr = `${partition}:${idToStr(workspaceId)}`;
      //add document for this workspace
      // bulk.push({
      //   _id: workspaceIdStr,
      //   type: 'workspace'
      // });
      bulkStr += objToStr({
        _id: workspaceIdStr,
        type: 'workspace'
      })
      //add documents for this workspace's photos
      for (var k = 0; k < PHOTOS_PER_RECORD; k++) {
        var photoId = NUM_RECORDS + workspaceId * PHOTOS_PER_RECORD + k;
        // bulk.push({
        //   _id: `${partition}:${idToStr(photoId)}`,
        //   type: 'photo',
        //   url: 'http://placekitten.com/200/300',
        //   description: 'lorem ipsum',
        //   workspaceId: workspaceIdStr,
        // })
        bulkStr += objToStr({
          _id: `${partition}:${idToStr(photoId)}`,
          type: 'photo',
          url: 'http://placekitten.com/200/300',
          description: 'lorem ipsum',
          workspaceId: workspaceIdStr,
        })
      }
    }
    bulkStr = bulkStr.slice(0, -1)
    bulkStr += ']}'
    try {
      // var outputObj = {
      //   docs: bulk
      // }
      await fs.writeFile(`./insertDocs/${partition}.json`, bulkStr);
    } catch(err) {
      console.log(err);
    }

  }
  console.log(`Done inserting ${NUM_RECORDS} records with ${PHOTOS_PER_RECORD} photos each (${NUM_RECORDS * PHOTOS_PER_RECORD} total)`);
})();