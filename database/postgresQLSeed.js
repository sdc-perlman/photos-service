const NUM_WORKSPACES = 10000000;
const PHOTOS_PER_WORKSPACE = 5;
const APPEND_CHUNK_LENGTH = 100;
const OUTPUT_SQL_FILE = './pgSeed.sql';

var fs = require('fs').promises;
var { words } = require('./exampleWords.js');


var idToStr = (id) => {
  return id.toString(36).padStart(5, '0');
}


(async () => {
  var seedStr = `
  CLOSE DATABASE sdcperlman;
  DROP DATABASE sdcperlman;
  CREATE DATABASE sdcperlman;
  CREATE TABLE photos (
      url varchar(100),
      description varchar(200),
      workspaceId varchar(5)
  );
  CREATE TABLE workspaces (
      workspaceId varchar(5)
  );\n`
  fs.writeFile(OUTPUT_SQL_FILE, seedStr);
  seedStr = '';

  words = words.join();
  words = words.split(" ");

  var getRandomWords = () => {
    var result = [];
    for (var i = 0; i < 7; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    return result.join().replace(/[.,'"\/#!$%\^&\*;:{}=\-_`~()]/g," ");
  }

  var sequentialId = 0;

  for (var i = 0; i < NUM_WORKSPACES; i++) {
    var workspaceId = idToStr(sequentialId);
    sequentialId++;

    seedStr += `INSERT INTO workspaces (workspaceId) VALUES ('${workspaceId}');\n`;
  
    for (var j = 0; j < PHOTOS_PER_WORKSPACE; j++) {
      seedStr += `INSERT INTO photos (url, description, workspaceId) VALUES ('https://rpt25-photos-service.s3-us-west-1.amazonaws.com/photos/${sequentialId % 100}.jpg', '${getRandomWords()}', '${workspaceId}');\n`;
      sequentialId++;
    }
    if (sequentialId % APPEND_CHUNK_LENGTH > APPEND_CHUNK_LENGTH - 6) {
      try {
        await fs.appendFile(OUTPUT_SQL_FILE, seedStr);
        seedStr = '';
      } catch (err) {
        console.log('Error writing seed script file', err);
      }
    }
  }




})();
