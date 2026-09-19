import pg from 'pg';

const { Client } = pg;

const combos = [
  {
    name: 'App User with App Password (TCP 127.0.0.1)',
    host: '127.0.0.1',
    user: process.env.SQL_USER || 'ai_studio_app_user',
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME || 'cloud_sql_development_database'
  },
  {
    name: 'Admin User with Admin Password (TCP 127.0.0.1)',
    host: '127.0.0.1',
    user: process.env.SQL_ADMIN_USER || 'ai_studio_admin',
    password: process.env.SQL_ADMIN_PASSWORD,
    database: process.env.SQL_DB_NAME || 'cloud_sql_development_database'
  },
  {
    name: 'App User with App Password (TCP localhost)',
    host: 'localhost',
    user: process.env.SQL_USER || 'ai_studio_app_user',
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME || 'cloud_sql_development_database'
  }
];

async function runDiag() {
  console.log('Testing Cloud SQL TCP Connection combinations...\n');
  
  for (const combo of combos) {
    console.log(`--- Testing Combo: ${combo.name} ---`);
    console.log(`Host: ${combo.host}`);
    console.log(`User: ${combo.user}`);
    console.log(`Database: ${combo.database}`);
    
    const client = new Client({
      host: combo.host,
      user: combo.user,
      password: combo.password,
      database: combo.database,
      port: 5432
    });

    try {
      await client.connect();
      console.log('✅ TCP Connection Success!');
      const res = await client.query('SELECT version();');
      console.log('Version:', res.rows[0]);
      await client.end();
      break;
    } catch (err: any) {
      console.error('❌ TCP Connection Failed:', err.message);
      console.error('Details:', err);
    }
    console.log('\n');
  }
}

runDiag();
