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

async function trace() {
  console.log('=== TRACING LOCAL CONTAINER LOGIN REQUESTS ===\n');

  // 1. Missing fields
  const t1 = await makeRequest('/api/auth/login', 'POST', {});
  console.log('1. Missing fields:', t1.status, t1.body);

  // 2. Non-existent user
  const t2 = await makeRequest('/api/auth/login', 'POST', { identifier: '01700000000', password: 'SomePassword123' });
  console.log('2. Non-existent user:', t2.status, t2.body);

  // 3. Let's create a test user first and try login to see if any 500 happens during login or sanitizeUserWithRoles!
  const ts = Date.now().toString().slice(-5);
  const phone = `0177${ts}1`;
  const email = `testtrace_${ts}@example.com`;
  const pass = 'TracePass123!';

  const reg = await makeRequest('/api/auth/register-request', 'POST', {
    fullName: 'Trace User',
    phone,
    email,
    gender: 'male',
    dateOfBirth: '1995-01-01',
    maritalStatus: 'unmarried',
    district: 'Dhaka',
    upazila: 'Gulshan',
    address: 'Gulshan 1',
    password: pass,
    confirmPassword: pass
  });

  console.log('3. Registration Request:', reg.status, reg.body?.devOtp ? 'devOtp received' : reg.body);

  if (reg.body?.devOtp) {
    const verify = await makeRequest('/api/auth/register-verify', 'POST', {
      identifier: phone,
      code: reg.body.devOtp
    });
    console.log('4. Verification:', verify.status, verify.body?.success);

    // Now test LOGIN
    const login = await makeRequest('/api/auth/login', 'POST', {
      identifier: phone,
      password: pass
    });
    console.log('5. Login with registered user:', login.status, login.body);
  }
}

trace().catch(console.error);
