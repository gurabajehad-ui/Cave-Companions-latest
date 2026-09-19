import { generateAdminToken } from './server/auth';
import dotenv from 'dotenv';
dotenv.config();

const token = generateAdminToken({ id: '1', email: 'admin@example.com', role: 'SUPER_ADMIN' });
console.log(token);
