const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database', 'safety_manager.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found at:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log('📊 Checking forms in database...\n');

db.all(
  'SELECT id, user_id, form_type, status, created_at FROM forms ORDER BY id DESC LIMIT 10',
  (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log('❌ No forms found in database');
    } else {
      console.log(`✅ Found ${rows.length} recent forms:\n`);
      rows.forEach((row) => {
        console.log(`  ID: ${row.id} | Type: ${row.form_type} | Status: ${row.status} | Date: ${row.created_at}`);
      });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM forms', (err, result) => {
      if (!err) {
        console.log(`\n📈 Total forms in database: ${result.total}`);
      }
      db.close();
    });
  }
);
