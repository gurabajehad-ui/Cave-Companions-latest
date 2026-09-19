import { pool } from './server/pg.js';
import { db } from './server/db.js';
import crypto from 'crypto';

async function runTests() {
  const client = await pool.connect();
  try {
    console.log("--- Starting Ad System Functional Tests ---");
    
    // Cleanup previous test data
    await client.query("DELETE FROM advertisements WHERE title LIKE 'Test Ad%'");
    await client.query("DELETE FROM advertisement_display_settings");
    
    // TEST 1: Basic Placement
    const ad1Id = crypto.randomUUID();
    await client.query(`
      INSERT INTO advertisements (id, title, sponsor_name, image_url, status, start_at)
      VALUES ($1, 'Test Ad 1', 'Sponsor 1', 'test.jpg', 'ACTIVE', NOW() - INTERVAL '1 day')
    `, [ad1Id]);
    await client.query(`
      INSERT INTO advertisement_display_locations (id, advertisement_id, page_name, placement_slot, priority)
      VALUES ($1, $2, 'CaveMarket', 'After Search Bar', 1)
    `, [crypto.randomUUID(), ad1Id]);
    
    let ads = await db.getActiveAdsForPage('CaveMarket', 'After Search Bar');
    if (ads.length === 1 && ads[0].title === 'Test Ad 1') {
      console.log("✅ TEST 1 - PLACEMENT PASSED");
    } else {
      console.log("❌ TEST 1 FAILED");
    }
    
    // TEST 2: Multiple Pages
    await client.query(`
      INSERT INTO advertisement_display_locations (id, advertisement_id, page_name, placement_slot, priority)
      VALUES ($1, $2, 'Home', 'Between Home Sections', 1)
    `, [crypto.randomUUID(), ad1Id]);
    let homeAds = await db.getActiveAdsForPage('Home', 'Between Home Sections');
    if (homeAds.length === 1 && homeAds[0].title === 'Test Ad 1') {
      console.log("✅ TEST 2 - MULTIPLE PAGES PASSED");
    } else {
      console.log("❌ TEST 2 FAILED");
    }

    // TEST 3: Page Limits
    const ad2Id = crypto.randomUUID();
    const ad3Id = crypto.randomUUID();
    await client.query(`
      INSERT INTO advertisements (id, title, sponsor_name, image_url, status, start_at)
      VALUES ($1, 'Test Ad 2', 'Sponsor 2', 'test2.jpg', 'ACTIVE', NOW() - INTERVAL '1 day')
    `, [ad2Id]);
    await client.query(`
      INSERT INTO advertisements (id, title, sponsor_name, image_url, status, start_at)
      VALUES ($1, 'Test Ad 3', 'Sponsor 3', 'test3.jpg', 'ACTIVE', NOW() - INTERVAL '1 day')
    `, [ad3Id]);
    
    await client.query(`
      INSERT INTO advertisement_display_locations (id, advertisement_id, page_name, placement_slot, priority)
      VALUES ($1, $2, 'CaveMarket', 'Middle Product List', 2)
    `, [crypto.randomUUID(), ad2Id]);
    await client.query(`
      INSERT INTO advertisement_display_locations (id, advertisement_id, page_name, placement_slot, priority)
      VALUES ($1, $2, 'CaveMarket', 'Bottom', 3)
    `, [crypto.randomUUID(), ad3Id]);
    
    // Set limit to 2 for CaveMarket
    await client.query(`
      INSERT INTO advertisement_display_settings (id, page_name, placement_slot, max_ads)
      VALUES ($1, 'CaveMarket', NULL, 2)
    `, [crypto.randomUUID()]);
    
    let marketAds = await db.getActiveAdsForPage('CaveMarket');
    // Ad1 (prio 1), Ad2 (prio 2), Ad3 (prio 3). Limit is 2. So Ad1 and Ad2 should be returned.
    if (marketAds.length === 2 && marketAds[0].title === 'Test Ad 1' && marketAds[1].title === 'Test Ad 2') {
      console.log("✅ TEST 5 - PAGE LIMIT PASSED");
    } else {
      console.log("❌ TEST 5 FAILED", marketAds.length);
      console.log(marketAds);
    }
    
    // TEST 4: Expiry
    const ad4Id = crypto.randomUUID();
    await client.query(`
      INSERT INTO advertisements (id, title, sponsor_name, image_url, status, start_at, end_at)
      VALUES ($1, 'Test Ad 4 Expired', 'Sponsor 4', 'test4.jpg', 'ACTIVE', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
    `, [ad4Id]);
    await client.query(`
      INSERT INTO advertisement_display_locations (id, advertisement_id, page_name, placement_slot, priority)
      VALUES ($1, $2, 'Home', 'Expired Slot', 1)
    `, [crypto.randomUUID(), ad4Id]);
    
    let expiredAds = await db.getActiveAdsForPage('Home', 'Expired Slot');
    if (expiredAds.length === 0) {
      console.log("✅ TEST 11 - EXPIRY PASSED");
    } else {
      console.log("❌ TEST 11 FAILED");
    }

    console.log("--- Tests Completed ---");
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    process.exit(0);
  }
}
runTests();
