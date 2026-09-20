import bcrypt from 'bcryptjs';

try {
  console.log('Test 1: valid bcrypt');
  const valid = bcrypt.hashSync('test', 10);
  console.log('compare:', bcrypt.compareSync('test', valid));

  console.log('\nTest 2: truncated hash ($2a$10$12345)');
  const res = bcrypt.compareSync('test', '$2a$10$12345');
  console.log('compare truncated:', res);
} catch (e) {
  console.error('\nBcrypt Exception Caught:');
  console.error('name:', e.name);
  console.error('message:', e.message);
  console.error('code:', e.code);
  console.error('stack:', e.stack);
}
