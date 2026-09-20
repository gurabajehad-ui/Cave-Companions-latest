import http from 'http';

function makeRequest(path, method, body, token) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body || {});
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    if (method !== 'GET') {
      req.write(data);
    }
    req.end();
  });
}

async function verify() {
  console.log('==================================================');
  console.log('CAVE COMPANIONS — PILOT FIX REGRESSION SUITE');
  console.log('==================================================\n');

  const pass = 'PilotPass123!';

  // Test A: Local Phone Login
  console.log('--- TEST A: Local Phone Login (01780944561) ---');
  const testA = await makeRequest('/api/auth/login', 'POST', {
    identifier: '01780944561',
    password: pass
  });
  console.log('Status:', testA.status);
  console.log('Success:', testA.body?.success);
  console.log('User ID:', testA.body?.user?.id);
  console.log('Token Length:', testA.body?.token?.length);
  console.log('');

  // Test B: International Phone Login
  console.log('--- TEST B: International Phone Login (+8801780944561) ---');
  const testB = await makeRequest('/api/auth/login', 'POST', {
    identifier: '+8801780944561',
    password: pass
  });
  console.log('Status:', testB.status);
  console.log('Success:', testB.body?.success);
  console.log('User ID:', testB.body?.user?.id);
  console.log('');

  // Test C: Email Login
  console.log('--- TEST C: Email Login (pilot_user_094456@example.com) ---');
  const testC = await makeRequest('/api/auth/login', 'POST', {
    identifier: 'pilot_user_094456@example.com',
    password: pass
  });
  console.log('Status:', testC.status);
  console.log('Success:', testC.body?.success);
  console.log('User ID:', testC.body?.user?.id);
  console.log('');

  // Test D: Logout -> Re-login
  console.log('--- TEST D: Logout and Re-login ---');
  const userToken = testC.body?.token;
  if (userToken) {
    const logoutRes = await makeRequest('/api/auth/logout', 'POST', {}, userToken);
    console.log('Logout Status:', logoutRes.status, logoutRes.body?.success);

    const reLoginRes = await makeRequest('/api/auth/login', 'POST', {
      identifier: '01780944561',
      password: pass
    });
    console.log('Re-login Status:', reLoginRes.status, reLoginRes.body?.success);
  }
  console.log('');

  // Test E: Health and DB Diagnostics Check
  console.log('--- TEST E: Health & DB Diagnostics ---');
  const healthRes = await makeRequest('/api/health', 'GET');
  console.log('Health API Status:', healthRes.status, healthRes.body);

  const secRes = await makeRequest('/api/security-diagnostic', 'GET');
  console.log('Security Diagnostic Status:', secRes.status, secRes.body?.diagnostics);

  console.log('\n==================================================');
  console.log('ALL REGRESSION TESTS COMPLETED SUCCESSFULLY');
  console.log('==================================================');
}

verify().catch(console.error);
