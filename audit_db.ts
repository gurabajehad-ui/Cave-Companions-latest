import { query } from './server/pg';

async function audit() {
  try {
    const vStatus = await query("SELECT verification_status, count(*) FROM merchant_verifications GROUP BY verification_status", []);
    console.log("Merchant Verifications Status Counts:", vStatus.rows);

    const sStatus = await query("SELECT status, count(*) FROM shops GROUP BY status", []);
    console.log("Shops Status Counts:", sStatus.rows);

    const mStatus = await query("SELECT status, count(*) FROM merchants GROUP BY status", []);
    console.log("Merchants Status Counts:", mStatus.rows);

    const redemptions = await query("SELECT count(*) FROM redemptions", []);
    console.log("Total Redemptions:", redemptions.rows[0]);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
audit();
