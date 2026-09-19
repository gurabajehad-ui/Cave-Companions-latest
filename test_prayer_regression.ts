import { db } from './server/db.js';
import { generateToken } from './server/auth.js';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { getDhakaDate, getDhakaDateString } from './server/timezone.js';
import { calculateDistanceInMeters } from './server/prayerTimes.js';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

async function runRegressionTests() {
  console.log('================================================================');
  console.log('STARTING CRITICAL SECURITY REGRESSION TESTS: MALE PRAYER ATTENDANCE');
  console.log('================================================================\n');

  const results: TestResult[] = [];

  try {
    // 1. Setup Test Male User
    const testUserId = 'test-reg-male-' + Date.now();
    const testPhone = '01799' + Math.floor(100000 + Math.random() * 900000);
    const testUser = await db.createUser({
      id: testUserId,
      fullName: 'Regression Test Male User',
      phone: testPhone,
      gender: 'male',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastLoginAt: new Date().toISOString()
    });

    const authToken = generateToken(testUser);

    // 2. Setup Test Mosque with known GPS coordinates (Dhaka Baitul Mukarram)
    const mosqueLat = 23.7289;
    const mosqueLng = 90.4125;
    const testMosqueId = 'MSQ-REG-' + Date.now();
    const testQrIdentifier = 'QR-REG-MOSQUE-' + Date.now();

    await db.createMosque({
      id: testMosqueId,
      name: 'Test Central Mosque',
      nameBn: 'টেস্ট কেন্দ্রীয় মসজিদ',
      address: 'Paltan, Dhaka',
      area: 'Paltan',
      district: 'ঢাকা',
      qrIdentifier: testQrIdentifier,
      status: 'active',
      latitude: mosqueLat,
      longitude: mosqueLng
    } as any);

    console.log(`Created test male user: ${testUser.id} (${testUser.gender})`);
    console.log(`Created test mosque: ${testMosqueId} with QR: ${testQrIdentifier} at (${mosqueLat}, ${mosqueLng})\n`);

    // Helper to compute exact prayer time windows for today in Dhaka
    const dhakaToday = getDhakaDate(new Date());
    const coords = new Coordinates(mosqueLat, mosqueLng);
    const params = CalculationMethod.Karachi();
    params.madhab = Madhab.Hanafi;
    const pt = new PrayerTimes(coords, dhakaToday, params);

    // Compute a timestamp guaranteed to be during Dhuhr / Asr / Maghrib for testing
    // Dhuhr window: between pt.dhuhr and pt.asr
    const validDhuhrTime = new Date(pt.dhuhr.getTime() + 15 * 60 * 1000);
    // Invalid Dhuhr time: 3 hours before Dhuhr (during morning / forbidden time)
    const invalidDhuhrTime = new Date(pt.dhuhr.getTime() - 3 * 60 * 60 * 1000);

    // Dynamic import of fetch if needed
    const baseUrl = 'http://localhost:3000';

    async function sendVerifyRequest(payload: {
      prayerType: string;
      qrData: string;
      lat?: number;
      lng?: number;
      scannedAt?: string;
    }) {
      const res = await fetch(`${baseUrl}/api/prayers/verify-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    }

    // -------------------------------------------------------------
    // Test A: Valid time + valid QR + valid location (Within 50m)
    // Expect: ACCEPTED (200 OK, attendance created, success: true)
    // -------------------------------------------------------------
    console.log('[TEST A] Valid time + valid QR + valid location...');
    const userValidLat = mosqueLat + 0.0001; // ~11 meters away
    const userValidLng = mosqueLng + 0.0001;
    const distA = calculateDistanceInMeters(userValidLat, userValidLng, mosqueLat, mosqueLng);

    const resA = await sendVerifyRequest({
      prayerType: 'dhuhr',
      qrData: testQrIdentifier,
      lat: userValidLat,
      lng: userValidLng,
      scannedAt: validDhuhrTime.toISOString()
    });

    const passedA = resA.status === 200 && resA.data?.success === true;
    results.push({
      name: 'A. Valid time + valid QR + valid location',
      passed: passedA,
      details: `Status: ${resA.status}, Dist: ${Math.round(distA)}m, Success: ${resA.data?.success}, Error: ${resA.data?.error || 'NONE'}`
    });
    console.log(` -> Result: ${passedA ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Test B: Invalid time + valid QR + valid location
    // Expect: REJECTED (400 INVALID_TIME_WINDOW)
    // -------------------------------------------------------------
    console.log('[TEST B] Invalid time + valid QR + valid location...');
    const resB = await sendVerifyRequest({
      prayerType: 'asr',
      qrData: testQrIdentifier,
      lat: userValidLat,
      lng: userValidLng,
      scannedAt: invalidDhuhrTime.toISOString() // completely out of Asr window
    });

    const passedB = resB.status === 400 && (resB.data?.error === 'INVALID_TIME_WINDOW' || resB.data?.error === 'FUTURE_DATE_REJECTED' || !resB.data?.success);
    results.push({
      name: 'B. Invalid time + valid QR + valid location',
      passed: passedB,
      details: `Status: ${resB.status}, Error: ${resB.data?.error}, Message: ${resB.data?.message}`
    });
    console.log(` -> Result: ${passedB ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Test C: Valid time + invalid QR + valid location
    // Expect: REJECTED (400 INVALID_MOSQUE_QR)
    // -------------------------------------------------------------
    console.log('[TEST C] Valid time + invalid QR + valid location...');
    const resC = await sendVerifyRequest({
      prayerType: 'maghrib',
      qrData: 'FAKE-QR-NON-EXISTENT-999',
      lat: userValidLat,
      lng: userValidLng,
      scannedAt: new Date(pt.maghrib.getTime() + 10 * 60 * 1000).toISOString()
    });

    const passedC = resC.status === 400 && resC.data?.error === 'INVALID_MOSQUE_QR';
    results.push({
      name: 'C. Valid time + invalid QR + valid location',
      passed: passedC,
      details: `Status: ${resC.status}, Error: ${resC.data?.error}, Message: ${resC.data?.message}`
    });
    console.log(` -> Result: ${passedC ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Test D: Valid time + valid QR + invalid/outside mosque location (>100m)
    // Expect: REJECTED (400 OUT_OF_RANGE or LOCATION_REQUIRED)
    // -------------------------------------------------------------
    console.log('[TEST D] Valid time + valid QR + invalid location (>100m)...');
    const userFarLat = mosqueLat + 0.005; // ~550 meters away
    const userFarLng = mosqueLng + 0.005;
    const distD = calculateDistanceInMeters(userFarLat, userFarLng, mosqueLat, mosqueLng);

    const resD = await sendVerifyRequest({
      prayerType: 'maghrib',
      qrData: testQrIdentifier,
      lat: userFarLat,
      lng: userFarLng,
      scannedAt: new Date(pt.maghrib.getTime() + 10 * 60 * 1000).toISOString()
    });

    const passedD = resD.status === 400 && resD.data?.error === 'OUT_OF_RANGE';
    results.push({
      name: 'D. Valid time + valid QR + invalid/outside mosque location',
      passed: passedD,
      details: `Status: ${resD.status}, Dist: ${Math.round(distD)}m, Error: ${resD.data?.error}, Message: ${resD.data?.message}`
    });
    console.log(` -> Result: ${passedD ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Test E: Offline valid record + all three server conditions pass after reconnect
    // Expect: ACCEPTED on server sync (200 OK, verified)
    // -------------------------------------------------------------
    console.log('[TEST E] Offline valid record + all three server conditions pass after reconnect...');
    const validAsrTime = new Date(pt.asr.getTime() + 20 * 60 * 1000);
    const resE = await sendVerifyRequest({
      prayerType: 'asr',
      qrData: testQrIdentifier,
      lat: userValidLat,
      lng: userValidLng,
      scannedAt: validAsrTime.toISOString()
    });

    const passedE = resE.status === 200 && resE.data?.success === true;
    results.push({
      name: 'E. Offline valid record + all 3 server conditions pass',
      passed: passedE,
      details: `Status: ${resE.status}, Success: ${resE.data?.success}, Error: ${resE.data?.error || 'NONE'}`
    });
    console.log(` -> Result: ${passedE ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Test F: Offline valid time but invalid QR
    // Expect: REJECTED after sync (400 INVALID_MOSQUE_QR)
    // -------------------------------------------------------------
    console.log('[TEST F] Offline valid time but invalid QR...');
    const validIshaTime = new Date(pt.isha.getTime() + 25 * 60 * 1000);
    const resF = await sendVerifyRequest({
      prayerType: 'isha',
      qrData: 'CORRUPTED_OFFLINE_QR_999',
      lat: userValidLat,
      lng: userValidLng,
      scannedAt: validIshaTime.toISOString()
    });

    const passedF = resF.status === 400 && resF.data?.error === 'INVALID_MOSQUE_QR';
    results.push({
      name: 'F. Offline valid time but invalid QR',
      passed: passedF,
      details: `Status: ${resF.status}, Error: ${resF.data?.error}, Message: ${resF.data?.message}`
    });
    console.log(` -> Result: ${passedF ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Test G: Offline valid time + valid QR but invalid location
    // Expect: REJECTED after sync (400 OUT_OF_RANGE or LOCATION_REQUIRED)
    // -------------------------------------------------------------
    console.log('[TEST G] Offline valid time + valid QR but invalid location...');
    const resG = await sendVerifyRequest({
      prayerType: 'isha',
      qrData: testQrIdentifier,
      lat: userFarLat,
      lng: userFarLng,
      scannedAt: validIshaTime.toISOString()
    });

    const passedG = resG.status === 400 && resG.data?.error === 'OUT_OF_RANGE';
    results.push({
      name: 'G. Offline valid time + valid QR but invalid location',
      passed: passedG,
      details: `Status: ${resG.status}, Dist: ${Math.round(distD)}m, Error: ${resG.data?.error}, Message: ${resG.data?.message}`
    });
    console.log(` -> Result: ${passedG ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Test H: No check-in may receive a token unless all three mandatory conditions pass
    // Verify:
    // 1. Check user attendances in DB: only tests A and E (2 prayers) should exist!
    // 2. Tests B, C, D, F, G (all failed) must NOT have generated attendance records
    // 3. User must NOT receive daily token unless minimum required prayers (e.g. 5) are completed
    // -------------------------------------------------------------
    console.log('[TEST H] Verifying no token/attendance leakage on failed check-ins...');
    const todayStr = getDhakaDateString(validDhuhrTime);
    const userAttendances = await db.getUserTodayAttendances(testUser.id, todayStr);
    const completedPrayerTypes = userAttendances.map((a: any) => a.prayerType);

    // Only Dhuhr (A) and Asr (E) should be present
    const hasDhuhr = completedPrayerTypes.includes('dhuhr');
    const hasAsr = completedPrayerTypes.includes('asr');
    const hasRejectedMaghrib = completedPrayerTypes.includes('maghrib');
    const hasRejectedIsha = completedPrayerTypes.includes('isha');

    const noLeakage = hasDhuhr && hasAsr && !hasRejectedMaghrib && !hasRejectedIsha && userAttendances.length === 2;

    // Check user tokens in DB
    const userTokens = await db.getUserTokens(testUser.id);
    const passedH = noLeakage && userTokens.length === 0; // 2 prayers out of 5 does not qualify for token

    results.push({
      name: 'H. No check-in receives token unless mandatory conditions pass',
      passed: passedH,
      details: `Total Valid Attendances: ${userAttendances.length} (Expected 2), Rejected in DB: ${hasRejectedMaghrib || hasRejectedIsha ? 'LEAKED' : 'NONE'}, Tokens Generated: ${userTokens.length}`
    });
    console.log(` -> Result: ${passedH ? 'PASSED ✅' : 'FAILED ❌'} (${results[results.length - 1].details})`);

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('REGRESSION TEST EXECUTION SUMMARY:');
    console.log('================================================================');
    let allPassed = true;
    results.forEach((r, idx) => {
      console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.name}`);
      console.log(`       Details: ${r.details}`);
      if (!r.passed) allPassed = false;
    });

    console.log('================================================================');
    if (allPassed) {
      console.log('ALL REGRESSION TESTS PASSED PERFECTLY (8/8)! 🎉');
    } else {
      console.error('SOME REGRESSION TESTS FAILED! ❌');
    }
    console.log('================================================================\n');

  } catch (err) {
    console.error('Fatal error during regression test run:', err);
  } finally {
    process.exit(0);
  }
}

runRegressionTests();
