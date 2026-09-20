import axios from 'axios';

async function checkHealth() {
  const baseUrl = 'https://ais-pre-vcbws6us32r6sun33hsm2p-846159832143.asia-southeast1.run.app';
  
  console.log('=== CHECKING DEPLOYED PILOT DIAGNOSTIC ENDPOINTS ===\n');

  try {
    const h = await axios.get(`${baseUrl}/api/health`);
    console.log('1. /api/health:', h.status, h.data);
  } catch (e) {
    console.log('1. /api/health failed:', e.message);
  }

  try {
    const db = await axios.get(`${baseUrl}/api/health/db`);
    console.log('2. /api/health/db:', db.status, db.data);
  } catch (e) {
    console.log('2. /api/health/db failed:', e.message, e.response?.data || '');
  }

  try {
    const sec = await axios.get(`${baseUrl}/api/security-diagnostic`);
    console.log('3. /api/security-diagnostic:', sec.status, sec.data);
  } catch (e) {
    console.log('3. /api/security-diagnostic failed:', e.message);
  }

  try {
    const debugDb = await axios.get(`${baseUrl}/api/debug-db`);
    console.log('4. /api/debug-db:', debugDb.status, debugDb.data);
  } catch (e) {
    console.log('4. /api/debug-db failed:', e.message, e.response?.data || '');
  }
}

checkHealth();
