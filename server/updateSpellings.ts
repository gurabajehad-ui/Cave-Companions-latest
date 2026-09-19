import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const map = {
    "Comilla": "Cumilla",
    "Jessore": "Jashore",
    "Bogra": "Bogura",
    "Jhalokati": "Jhalokathi"
  };
  
  try {
    for (const [oldName, newName] of Object.entries(map)) {
      console.log(`Updating ${oldName} to ${newName}`);
      await pool.query('UPDATE districts SET name = $1 WHERE name = $2', [newName, oldName]);
      await pool.query('UPDATE district_delivery_charges SET district_name = $1 WHERE district_name = $2', [newName, oldName]);
    }
    console.log("Done");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
