const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  const map = {
    "Comilla": "Cumilla",
    "Jessore": "Jashore",
    "Bogra": "Bogura",
    "Jhalokati": "Jhalokathi"
  };
  
  try {
    for (const [oldName, newName] of Object.entries(map)) {
      console.log(`Updating ${oldName} to ${newName}`);
      await client.query('UPDATE districts SET name = $1 WHERE name = $2', [newName, oldName]);
      await client.query('UPDATE district_delivery_charges SET district_name = $1 WHERE district_name = $2', [newName, oldName]);
    }
    console.log("DB update complete");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
