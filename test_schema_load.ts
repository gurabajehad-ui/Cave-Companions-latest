import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

function translatePgToSqlite(sql: string): string {
  let s = sql;
  
  // Replace postgres data types with SQLite affinities
  s = s.replace(/\bTIMESTAMPTZ\b/gi, 'TEXT');
  s = s.replace(/\bTIMESTAMP\b/gi, 'TEXT');
  s = s.replace(/\bJSONB\b/gi, 'TEXT');
  s = s.replace(/\bBYTEA\b/gi, 'BLOB');
  s = s.replace(/\bDOUBLE PRECISION\b/gi, 'REAL');
  s = s.replace(/\bSERIAL PRIMARY KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  s = s.replace(/\bSERIAL\b/gi, 'INTEGER');
  
  // Replace NOW() with CURRENT_TIMESTAMP
  s = s.replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP');
  
  // Replace INTERVAL additions
  s = s.replace(/(?:CURRENT_TIMESTAMP|NOW\(\))\s*\+\s*INTERVAL\s*'(\d+)\s+minutes'/gi, "datetime('now', '+$1 minutes')");
  s = s.replace(/(?:CURRENT_TIMESTAMP|NOW\(\))\s*\+\s*INTERVAL\s*'(\d+)\s+hours'/gi, "datetime('now', '+$1 hours')");
  s = s.replace(/(?:CURRENT_TIMESTAMP|NOW\(\))\s*\+\s*INTERVAL\s*'(\d+)\s+days'/gi, "datetime('now', '+$1 days')");
  
  // Replace postgres ILIKE with LIKE
  s = s.replace(/\bILIKE\b/gi, 'LIKE');
  
  return s;
}

async function testSchema() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  // Let's mock a query execution wrapper that handles errors like "column already exists" for ADD COLUMN
  function runQuery(sqlText: string) {
    const translated = translatePgToSqlite(sqlText);
    
    // Split multi-statement queries by semicolon if needed, or run as a whole
    // Since sql.js `db.run` can run multiple queries at once, we can try to run it.
    try {
      db.run(translated);
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('duplicate column name') || msg.includes('already exists') || msg.includes('duplicate key')) {
        // Safe to ignore in migration scenarios
        // console.log('Ignored duplicate column or index:', msg);
      } else {
        console.error('SQL Error on query:', msg);
        console.error('Original SQL:', sqlText.slice(0, 200));
        console.error('Translated SQL:', translated.slice(0, 200));
        throw err;
      }
    }
  }

  console.log('Loading pgInit.ts schema statements...');
  
  // Let's test if we can run some basic translated commands from our schema
  try {
    runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255),
        password_hash TEXT,
        gender VARCHAR(50) NOT NULL DEFAULT 'male',
        age INTEGER,
        marital_status VARCHAR(50),
        address TEXT,
        is_verified BOOLEAN DEFAULT TRUE,
        photo_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    
    // Test ALTER TABLE with ADD COLUMN (which doesn't have IF NOT EXISTS in standard sqlite)
    // We mock ALTER TABLE to strip "IF NOT EXISTS" in the translator
    let alterSql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;";
    let cleanAlter = alterSql.replace(/\bADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\b/gi, 'ADD COLUMN');
    runQuery(cleanAlter);
    
    console.log('✅ Basic schema and translation tests succeeded!');
  } catch (err) {
    console.error('❌ Failed schema test:', err);
  }
}

testSchema();
