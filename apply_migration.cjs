const fs = require('fs');
const { Client } = require('pg');

async function apply() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const sql = fs.readFileSync('migrations/002_add_riders_table.sql', 'utf8');
  await client.query(sql);
  await client.end();
  console.log('Migration applied');
}
apply().catch(console.error);
