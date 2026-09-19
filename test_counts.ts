import { query } from './server/pg';
async function test() {
  try {
    const shopsCount = await query("SELECT COUNT(*) FROM shops", []);
    const merchantsCount = await query("SELECT COUNT(*) FROM merchants", []);
    const verificationsCount = await query("SELECT COUNT(*) FROM merchant_verifications", []);
    console.log("Shops:", shopsCount.rows[0]);
    console.log("Merchants:", merchantsCount.rows[0]);
    console.log("Verifications:", verificationsCount.rows[0]);
  } catch(e) { console.error(e) }
  process.exit(0);
}
test();
