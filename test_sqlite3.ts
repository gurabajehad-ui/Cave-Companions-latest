import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE lorem (info TEXT)");

  const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (let i = 0; i < 10; i++) {
    stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.all("SELECT rowid AS id, info FROM lorem", (err, rows) => {
    if (err) {
      console.error('Error running select query:', err);
    } else {
      console.log('Successfully queried rows from local in-memory SQLite3:', rows);
    }
  });
});

db.close();
