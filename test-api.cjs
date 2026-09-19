const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/register-request',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', JSON.stringify(res.headers, null, 2));
  res.setEncoding('utf8');
  res.on('data', (chunk) => console.log('BODY:', chunk));
});

req.on('error', (e) => console.error('ERROR:', e.message));

req.write(JSON.stringify({
  fullName: "Test User",
  phone: "01700000000",
  password: "password123",
  confirmPassword: "password123",
  gender: "male"
}));
req.end();
