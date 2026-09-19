import { db } from './db.js';
import { pool } from './pg.ts';

async function runTokenRulesTest() {
  console.log('==================================================');
  console.log('RUNNING CAVE COMPANIONS TOKEN RULES AUDIT SUITE');
  console.log('==================================================\n');

  const testUserId = `TEST-USR-${Date.now()}`;
  const testShopId = `SHP-TEST-${Date.now()}`;
  const todayStr = '2026-08-19';
  const nextDayStr = '2026-08-20';

  try {
    // 0. Seed test user & test shop in database
    const testPhone = `017${Math.floor(Math.random() * 89999999 + 10000000)}`;
    await pool.query(`
      INSERT INTO users (id, phone, full_name, status, created_at)
      VALUES ($1, $2, 'Test User', 'active', NOW())
    `, [testUserId, testPhone]);

    const qrSecret = 'test-secret-123';
    const qrIdentifier = `QR-TEST-${Date.now()}`;
    await pool.query(`
      INSERT INTO shops (id, name, name_bn, owner_id, phone, address, area, district, category, qr_identifier, qr_secret, status)
      VALUES ($1, 'Test Shop', 'টেস্ট শপ', $2, $3, 'Dhanmondi', 'Dhanmondi', 'Dhaka', 'Food', $4, $5, 'ACTIVE')
    `, [testShopId, testUserId, testPhone, qrIdentifier, qrSecret]);

    // Construct valid QR payload string expected by verifyShopQr
    const qrPayload = JSON.stringify({
      shopId: testShopId,
      qrIdentifier: qrIdentifier,
      secret: qrSecret
    });

    console.log('--- TEST A: TOKEN EARNING (DAILY LIMIT = 1 TOKEN) ---');
    // Log 5 prayers for today
    const prayers = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];
    for (let p = 0; p < prayers.length; p++) {
      await pool.query(`
        INSERT INTO prayer_attendances (id, user_id, mosque_id, mosque_name, prayer_type, date, status, verified_at)
        VALUES ($1, $2, 'MSQ-01', 'Test Mosque', $3, $4, 'verified', NOW())
      `, [`ATT-${Date.now()}-${p}`, testUserId, prayers[p], todayStr]);
    }

    // Earn token 1 for today (5 prayers = GOLD)
    const resA1 = await db.generateOrUpdateDailyToken(testUserId, todayStr);
    console.log('Earn Token 1 Today Result:', resA1.action, '| Token ID:', resA1.token?.id, '| Type:', resA1.token?.tokenType);
    const passA1 = resA1.generated && resA1.token?.tokenType === 'GOLD';

    // Attempt to earn another token on the same day
    const resA2 = await db.generateOrUpdateDailyToken(testUserId, todayStr);
    console.log('Earn Second Token Same Day Result:', resA2.action, '| Generated New Token?:', resA2.generated);
    // Should NOT generate a new token
    const passA2 = !resA2.generated && resA2.token?.id === resA1.token?.id;

    console.log(`TEST A RESULT: ${passA1 && passA2 ? 'PASS ✅' : 'FAIL ❌'}\n`);

    console.log('--- TEST B: MULTIPLE REDEMPTIONS IN ONE DAY (10 TOKENS) ---');
    // Seed 10 unused tokens for the user across past dates
    const createdTokenIds: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const pastDate = `2026-08-${i.toString().padStart(2, '0')}`;
      const tokId = `TOK-SUITE-${Date.now()}-${i}`;
      await pool.query(`
        INSERT INTO tokens (id, user_id, token_type, status, earned_date, source_prayer_count, created_at)
        VALUES ($1, $2, 'GOLD', 'AVAILABLE', $3, 5, NOW())
      `, [tokId, testUserId, pastDate]);
      createdTokenIds.push(tokId);
    }

    let redemptionSuccessCount = 0;
    for (let i = 0; i < createdTokenIds.length; i++) {
      const tokId = createdTokenIds[i];
      
      // Get a fresh verification ID for each redemption
      const vRes = await db.verifyShopQr(qrPayload, testUserId);
      if (!vRes.valid || !vRes.verificationId) {
        console.log(`Redemption Token ${i + 1} (${tokId}): VERIFICATION FAILED ❌`);
        continue;
      }

      const rdmRes = await db.executeRedemptionTransaction({
        userId: testUserId,
        tokenId: tokId,
        verificationId: vRes.verificationId,
        purchaseAmount: 500,
        todayDateStr: todayStr
      });

      if (rdmRes.success) {
        redemptionSuccessCount++;
        console.log(`Redemption Token ${i + 1} (${tokId}): PASS ✅`);
      } else {
        console.log(`Redemption Token ${i + 1} (${tokId}): REJECTED ❌ (${rdmRes.message})`);
      }
    }

    const passB = redemptionSuccessCount === 10;
    console.log(`TEST B RESULT (10 Redemptions Same Day): ${passB ? 'PASS ✅' : 'FAIL ❌'}\n`);

    console.log('--- TEST C: RE-REDEEMING A PREVIOUSLY USED TOKEN ---');
    // Attempt to redeem Token 1 (createdTokenIds[0]) again
    // First verify QR again
    const vResC = await db.verifyShopQr(qrPayload, testUserId);
    const reuseRes = await db.executeRedemptionTransaction({
      userId: testUserId,
      tokenId: createdTokenIds[0],
      verificationId: vResC.verificationId!,
      purchaseAmount: 500,
      todayDateStr: todayStr
    });

    console.log('Re-redemption attempt result:', reuseRes.success ? 'UNEXPECTED PASS ❌' : 'REJECTED AS EXPECTED ✅', '| Reason:', reuseRes.message);
    const passC = !reuseRes.success && reuseRes.error === 'TOKEN_ALREADY_USED';
    console.log(`TEST C RESULT: ${passC ? 'PASS ✅' : 'FAIL ❌'}\n`);

    console.log('--- TEST D: EARNING NEXT DAY ---');
    // Log 4 prayers for next day
    for (let p = 0; p < 4; p++) {
      await pool.query(`
        INSERT INTO prayer_attendances (id, user_id, mosque_id, mosque_name, prayer_type, date, status, verified_at)
        VALUES ($1, $2, 'MSQ-01', 'Test Mosque', $3, $4, 'verified', NOW())
      `, [`ATT-NEXT-${Date.now()}-${p}`, testUserId, prayers[p], nextDayStr]);
    }

    const resD = await db.generateOrUpdateDailyToken(testUserId, nextDayStr);
    console.log('Earn Token Next Day Result:', resD.action, '| Generated New Token?:', resD.generated, '| Type:', resD.token?.tokenType);
    const passD = resD.generated && resD.token?.tokenType === 'SILVER';
    console.log(`TEST D RESULT: ${passD ? 'PASS ✅' : 'FAIL ❌'}\n`);

    // Clean up test records
    await pool.query(`DELETE FROM redemptions WHERE user_id = $1`, [testUserId]);
    await pool.query(`DELETE FROM tokens WHERE user_id = $1`, [testUserId]);
    await pool.query(`DELETE FROM prayer_attendances WHERE user_id = $1`, [testUserId]);
    await pool.query(`DELETE FROM shops WHERE id = $1`, [testShopId]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);

    console.log('==================================================');
    console.log('FINAL AUDIT SUMMARY:');
    console.log('TEST A (Daily Earning Limit = 1):', passA1 && passA2 ? 'PASS' : 'FAIL');
    console.log('TEST B (10 Redemptions Same Day):', passB ? 'PASS' : 'FAIL');
    console.log('TEST C (Double Redemption Rejection):', passC ? 'PASS' : 'FAIL');
    console.log('TEST D (Next Day New Token Earning):', passD ? 'PASS' : 'FAIL');
    console.log('==================================================');

    if (passA1 && passA2 && passB && passC && passD) {
      console.log('STATUS: GO 🚀');
    } else {
      console.log('STATUS: NO-GO ❌');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await pool.end();
  }
}

runTokenRulesTest();
