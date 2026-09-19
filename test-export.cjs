const http = require('http');
const https = require('https');

async function testExport() {
  const adminToken = 'SUPERADMIN_TEMP_TEST_KEY_2024';
  const url = 'http://localhost:3000/api/admin/online-accounts/export';
  console.log('Fetching', url);
  http.get(url, { headers: { 'Authorization': `Bearer ${adminToken}` } }, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    let size = 0;
    res.on('data', chunk => size += chunk.length);
    res.on('end', () => {
      console.log('Response size:', size);
      process.exit(0);
    });
  }).on('error', err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
testExport();
