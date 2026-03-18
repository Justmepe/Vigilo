const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../database/safety_manager.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  Removed existing database');
}

// Create new database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error creating database:', err);
    process.exit(1);
  }
  console.log('✅ Database created');
});

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error executing schema:', err);
    process.exit(1);
  }
  console.log('✅ Database schema created');
  console.log('✅ Default admin user created (admin/Admin123!)');
  console.log('✅ Sample facilities added');
  
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
      process.exit(1);
    }
    console.log('\n🎉 Database initialization complete!');
  });
});
