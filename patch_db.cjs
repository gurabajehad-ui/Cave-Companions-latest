const fs = require('fs');
let content = fs.readFileSync('server/db.ts', 'utf8');

const target = `  async approveMerchantVerification(merchantIdOrShopId: string, adminName: string): Promise<MerchantVerificationRecord | null> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const vrfRes = await client.query(\`
        SELECT * FROM merchant_verifications WHERE merchant_id = $1 OR shop_id = $1 OR id = $1 ORDER BY submitted_at DESC LIMIT 1
      \`, [merchantIdOrShopId]);

      let merchantId = merchantIdOrShopId;
      let shopId = merchantIdOrShopId;

      if (vrfRes.rows.length > 0) {
        merchantId = vrfRes.rows[0].merchant_id;
        shopId = vrfRes.rows[0].shop_id;

        await client.query(\`
          UPDATE merchant_verifications SET
            verification_status = 'APPROVED',
            merchant_status = 'ACTIVE',
            reviewed_at = NOW(),
            reviewed_by = $1,
            updated_at = NOW()
          WHERE id = $2
        \`, [adminName, vrfRes.rows[0].id]);
      }

      await client.query(\`
        UPDATE shops SET status = 'ACTIVE', verification_status = 'APPROVED', updated_at = NOW() WHERE id = $1
      \`, [shopId]);

      await client.query(\`
        UPDATE merchants SET status = 'active', verification_status = 'APPROVED', updated_at = NOW() WHERE id = $1 OR shop_id = $1
      \`, [merchantId]);

      await client.query('COMMIT');
      return this.getMerchantVerificationByMerchantId(merchantId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }`;

const replacement = `  async approveMerchantVerification(merchantIdOrShopId: string, adminName: string): Promise<MerchantVerificationRecord | null> {
    const client = await getClient();
    console.log(\`[DB approveMerchantVerification] Starting approval transaction for parameter: \${merchantIdOrShopId}\`);
    try {
      await client.query('BEGIN');

      const vrfRes = await client.query(\`
        SELECT * FROM merchant_verifications WHERE merchant_id = $1 OR shop_id = $1 OR id = $1 ORDER BY submitted_at DESC LIMIT 1
      \`, [merchantIdOrShopId]);

      let merchantId = merchantIdOrShopId;
      let shopId = merchantIdOrShopId;

      if (vrfRes.rows.length > 0) {
        merchantId = vrfRes.rows[0].merchant_id;
        shopId = vrfRes.rows[0].shop_id;
        const verificationId = vrfRes.rows[0].id;
        console.log(\`[DB approveMerchantVerification] Found merchant_verifications record. ID: \${verificationId}, Merchant: \${merchantId}, Shop: \${shopId}\`);

        const updateVrfRes = await client.query(\`
          UPDATE merchant_verifications SET
            verification_status = 'APPROVED',
            merchant_status = 'ACTIVE',
            reviewed_at = NOW(),
            reviewed_by = $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING id
        \`, [adminName, verificationId]);
        console.log(\`[DB approveMerchantVerification] Updated merchant_verifications. Rows affected: \${updateVrfRes.rowCount}\`);
      } else {
        console.log(\`[DB approveMerchantVerification] No merchant_verifications record found for \${merchantIdOrShopId}, falling back to passed ID.\`);
      }

      const updateShopRes = await client.query(\`
        UPDATE shops SET status = 'ACTIVE', verification_status = 'APPROVED', updated_at = NOW() WHERE id = $1
      \`, [shopId]);
      console.log(\`[DB approveMerchantVerification] Updated shops. Rows affected: \${updateShopRes.rowCount}\`);

      const updateMerchantRes = await client.query(\`
        UPDATE merchants SET status = 'active', verification_status = 'APPROVED', updated_at = NOW() WHERE id = $1 OR shop_id = $1
      \`, [merchantId]);
      console.log(\`[DB approveMerchantVerification] Updated merchants. Rows affected: \${updateMerchantRes.rowCount}\`);

      await client.query('COMMIT');
      console.log(\`[DB approveMerchantVerification] Transaction COMMITTED successfully.\`);
      return this.getMerchantVerificationByMerchantId(merchantId);
    } catch (err) {
      console.error(\`[DB approveMerchantVerification] Transaction error, rolling back:\`, err);
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }`;

content = content.replace(target, replacement);
fs.writeFileSync('server/db.ts', content);
