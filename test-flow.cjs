const http = require('http');

async function req(path, data) {
  return new Promise((resolve, reject) => {
    const r = http.request({
      hostname: '127.0.0.1', port: 3000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    r.write(JSON.stringify(data));
    r.end();
  });
}

(async () => {
  const r1 = await req('/api/auth/register-request', {
    fullName: "Test User", phone: "01700000001", password: "password123", confirmPassword: "password123", gender: "male"
  });
  console.log('Register request:', r1);
  const r2 = await req('/api/auth/register-verify', {
    identifier: "01700000001", code: r1.body.devOtp
  });
  console.log('Register verify:', r2);
  const r3 = await req('/api/auth/login', {
    identifier: "01700000001", password: "password123"
  });
  console.log('Login:', r3);
})();
