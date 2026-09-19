const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cave_companions' });
pool.query('SELECT * FROM shops WHERE LOWER(category) IN (\'health\', \'pharmacy\') OR LOWER(business_type) IN (\'health\', \'pharmacy\')').then(res => {
  console.log("HEALTH SHOPS FOUND:", res.rows.length);
  res.rows.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, Category: ${r.category}, BusinessType: ${r.business_type}, Status: ${r.status}`));
  pool.end();
}).catch(err => { console.error(err); pool.end(); });
