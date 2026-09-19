const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cave_companions' });

async function run() {
  try {
    const id = 'NAS-' + Date.now();
    const res = await pool.query(`INSERT INTO nasiha (id, text_bn, source_bn, active) VALUES ($1, $2, $3, $4) RETURNING *`, [id, 'Test', 'Source', true]);
    console.log("Inserted:", res.rows[0]);

    // Now let's try to update it manually mimicking the db.ts logic
    const updates = { textBn: 'Updated Test', sourceBn: 'Updated Source', active: false };
    const setClauses = [];
    const values = [];
    let idx = 1;
    if (updates.textBn !== undefined) {
      setClauses.push(`text_bn = $${idx++}`);
      values.push(updates.textBn.trim());
    }
    if (updates.sourceBn !== undefined) {
      setClauses.push(`source_bn = $${idx++}`);
      values.push(updates.sourceBn.trim());
    }
    if (updates.active !== undefined) {
      setClauses.push(`active = $${idx++}`);
      values.push(updates.active);
    }
    values.push(id);
    const updateRes = await pool.query(`UPDATE nasiha SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    console.log("Updated:", updateRes.rows[0]);

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
