const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT id, name, qr_identifier FROM shops LIMIT 1");
  console.log(res.rows[0]);
  client.end();
}
run();
