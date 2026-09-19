import { pool } from './server/pg.js';

async function test() {
  const client = await pool.connect();
  try {
    const userRes = await client.query('SELECT phone FROM users WHERE phone = $1', ['01711000001']);
    console.log('User found in users table:', userRes.rows.length > 0);
    
    const merchantRes = await client.query('SELECT phone FROM merchants WHERE phone = $1', ['01711000001']);
    console.log('Merchant found in merchants table:', merchantRes.rows.length > 0);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

test();
