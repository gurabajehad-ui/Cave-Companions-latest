import { query } from './server/pg';
async function run() {
  const res = await query(`
    SELECT s.id, s.name as shop_name, s.status as shop_status, s.verification_status,
           m.id as merchant_id, m.name as owner_name, m.phone as phone,
           v.id as verification_id
    FROM shops s
    LEFT JOIN merchants m ON m.shop_id = s.id
    LEFT JOIN merchant_verifications v ON v.shop_id = s.id
  `, []);
  console.log(res.rows);
  process.exit(0);
}
run();
