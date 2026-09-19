import { normalizePhoneNumber } from './server/db.js';

const phones = ['01700000000', '০১৭০০০০০০০০', '+8801700000000'];
phones.forEach(p => {
  console.log(`Phone: ${p}, Normalized: ${normalizePhoneNumber(p)}`);
});
