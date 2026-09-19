import { generateToken } from './server/auth.js';
const token = generateToken({ id: 'test-user', phone: '01700000000', fullName: 'Test' } as any);
console.log(token);
