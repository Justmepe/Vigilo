const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = 'd:\\Safety\\database\\safety_manager.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  // Generate hash for Admin123!
  bcrypt.hash('Admin123!', 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      process.exit(1);
    }

    console.log('Generated hash:', hash);

    // Update admin user password
    db.run(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hash, 'admin'],
      (err) => {
        if (err) {
          console.error('Error updating password:', err);
          process.exit(1);
        }
        console.log('✅ Admin password reset to: Admin123!');
        
        // Verify it worked
        db.get('SELECT username, password_hash FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (err) {
            console.error('Error fetching user:', err);
            process.exit(1);
          }
          console.log('User in database:', row);
          db.close();
          process.exit(0);
        });
      }
    );
  });
});
