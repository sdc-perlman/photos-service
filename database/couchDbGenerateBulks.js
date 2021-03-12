var fs = require('fs').promises;
var { words } = require('./exampleWords.js');
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
  return id.toString(36).padStart(5, '0');
}



(async  () => {
  var sequentialId = 0;
  words = words.join();
  words = words.split(" ");

  var getRandomWords = () => {
    var result = [];
    for (var i = 0; i < 7; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    return result.join();
  }

  //Make NUM_RECORDS records
  for (var i = 0; i < Math.floor(NUM_RECORDS/PARTITION_SIZE); i++) {
    //make an object to insert for this partition
    var bulk = [];
    var bulkStr = "{ \"docs\": ["
    for (var j = 0; j < PARTITION_SIZE; j++) {
      var partition = (i).toString();
      var workspaceId = sequentialId; //i * PARTITION_SIZE + j;
      sequentialId++;
      var workspaceIdStr = `${idToStr(workspaceId)}`;


      bulkStr += objToStr({
        type: 'workspace',
        workspaceId: workspaceIdStr
      })
      //add documents for this workspace's photos
      for (var k = 0; k < PHOTOS_PER_RECORD; k++) {
        var photoId = sequentialId; 
        sequentialId++;

        bulkStr += objToStr({
          type: 'photo',
          url: `https://rpt25-photos-service.s3-us-west-1.amazonaws.com/photos/${sequentialId % 100}.jpg`, //'http://placekitten.com/200/300',
          description: getRandomWords(),
          workspaceId: workspaceIdStr,
        })
      }
    }
    bulkStr = bulkStr.slice(0, -1)
    bulkStr += ']}'
    try {
      await fs.writeFile(`./insertDocs/${partition}.json`, bulkStr);
    } catch(err) {
      console.log(err);
    }

  }
  console.log(`Done inserting ${NUM_RECORDS} records with ${PHOTOS_PER_RECORD} photos each (${NUM_RECORDS * PHOTOS_PER_RECORD} total)`);
})();