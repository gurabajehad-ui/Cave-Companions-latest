const http = require('http');
const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/register-verify',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});
req.write(JSON.stringify({
  identifier: "01700000000",
  otpCode: "242515"
}));
req.end();
