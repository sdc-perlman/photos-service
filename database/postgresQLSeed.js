const { Client } = require('pg');
const client = new Client();

(async () => {
  await client.connect();

})();
