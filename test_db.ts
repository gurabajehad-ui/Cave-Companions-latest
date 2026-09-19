import { pool } from './server/pg.js';

async function test() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT name, phone FROM merchants');
    console.log('Merchants in DB:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

test();
