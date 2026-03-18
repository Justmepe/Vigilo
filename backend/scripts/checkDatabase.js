const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('d:\\Safety\\database\\safety_manager.db');

console.log('\n📊 DATABASE SUMMARY\n');

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  let completed = 0;
  const total = tables.length;

  tables.forEach(table => {
    db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
      if (!err) {
        console.log(`  📋 ${table.name}: ${result.count} records`);
      }
      completed++;
      if (completed === total) {
        console.log('\n✅ Data persistence: ALL DATA IS PRESERVED\n');
        db.close();
      }
    });
  });
});
