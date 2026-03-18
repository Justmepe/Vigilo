const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database', 'safety_manager.db');

const db = new sqlite3.Database(dbPath);

console.log('📋 Checking form 7 content...\n');

db.get(
  'SELECT id, form_type, form_data FROM forms WHERE id = 7',
  (err, row) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    }

    if (!row) {
      console.log('❌ Form 7 not found');
    } else {
      console.log(`✅ Form ID: ${row.id}`);
      console.log(`Type: ${row.form_type}`);
      console.log(`\nForm Data (first 500 chars):`);
      const data = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data;
      console.log(JSON.stringify(data, null, 2).substring(0, 500));
    }

    db.close();
  }
);
