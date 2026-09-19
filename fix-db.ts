import pg from 'pg';

async function fix() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    console.log("Running alter table commands...");
    await client.query(`
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT 0;
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT 0;
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS imam_image_url TEXT;
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS requested_by_user_id VARCHAR(255);
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS requested_by_name VARCHAR(255);
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS requested_by_phone VARCHAR(255);
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);
      ALTER TABLE mosques ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
    process.exit(0);
  }
}
fix();
