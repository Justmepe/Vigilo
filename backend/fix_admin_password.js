#!/usr/bin/env node
// Generate correct password hash
const bcrypt = require('bcrypt');

const password = 'Admin123!';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Hash for "Admin123!":', hash);
    
    // Update database
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('../database/safety_manager.db', (err) => {
      if (err) {
        console.error('DB error:', err);
        process.exit(1);
      }
      
      db.run(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        [hash, 'admin'],
        function(err) {
          if (err) {
            console.error('Update error:', err);
          } else {
            console.log('✅ Admin password hash updated');
          }
          db.close();
          process.exit(0);
        }
      );
    });
  }
});
