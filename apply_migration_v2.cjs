const { pool } = require('./server/pg.js');
const fs = require('fs');

async function apply() {
  const sql = fs.readFileSync('migrations/002_add_riders_table.sql', 'utf8');
  await pool.query(sql);
  console.log('Migration applied');
  process.exit(0);
}
apply().catch(err => {
  console.error(err);
  process.exit(1);
});
