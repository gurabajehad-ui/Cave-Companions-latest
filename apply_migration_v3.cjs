const { Pool } = require('pg');
const fs = require('fs');

async function apply() {
  const pool = new Pool({
    host: process.env.SQL_HOST || '127.0.0.1',
    user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
    password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD,
    database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
    port: Number(process.env.SQL_PORT) || 5432,
  });
  const sql = fs.readFileSync('migrations/002_add_riders_table.sql', 'utf8');
  await pool.query(sql);
  console.log('Migration applied');
  process.exit(0);
}
apply().catch(err => {
  console.error(err);
  process.exit(1);
});
