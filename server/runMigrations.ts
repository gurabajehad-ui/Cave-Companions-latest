import { pool } from './pg.js';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('[Migration] Running PostgreSQL migrations...');
    await client.query('BEGIN');

    // 001_add_address_to_users.sql
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
    `);

    // 002_add_updated_by_to_shops.sql
    await client.query(`
      ALTER TABLE shops ADD COLUMN IF NOT EXISTS updated_by TEXT;
    `);

    // 003_add_dob_to_users.sql
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    `);

    // 004_add_geo_to_users.sql
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS district TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS upazila TEXT;
    `);

    await client.query('COMMIT');
    console.log('[Migration] All migrations executed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Migration] Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run directly if executed as standalone script
if (process.argv[1] && process.argv[1].endsWith('runMigrations.ts')) {
  runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}
