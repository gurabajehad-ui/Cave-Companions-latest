import http from 'http';

function makeRequest(path, method, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('=== TRIGGERING LOGIN ON PORT 3000 ===');
  // Attempt login with existing registered test user
  const res = await makeRequest('/api/auth/login', 'POST', {
    identifier: '01780944561',
    password: 'PilotPass123!'
  });
  console.log('Status:', res.status);
  console.log('Response Body:', res.body);
}

run();
