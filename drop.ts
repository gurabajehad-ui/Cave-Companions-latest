import { query } from './server/pg.js'; query('SELECT * FROM district_delivery_charges LIMIT 2').then(res=>console.log(res.rows)).catch(console.error).finally(()=>process.exit(0));
