const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = 'd:\\Safety\\database\\safety_manager.db';

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0] || 'test';
const password = args[1] || 'Test123!';
const fullName = args[2] || 'Test User';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  // Generate hash for password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      process.exit(1);
    }

    // Check if user exists
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        console.error('Error checking user:', err);
        db.close();
        process.exit(1);
      }

      const query = row
        ? 'UPDATE users SET password_hash = ?, full_name = ? WHERE username = ?'
        : 'INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)';

      const params = row
        ? [hash, fullName, username]
        : [username, `${username}@silverbaycatering.com`, hash, fullName, 'User', 1];

      db.run(query, params, (err) => {
        if (err) {
          console.error('Error updating/creating user:', err);
          db.close();
          process.exit(1);
        }
        const action = row ? 'Updated' : 'Created';
        console.log(`✅ ${action} user: ${username}`);
        console.log(`   Password: ${password}`);
        console.log(`   Full Name: ${fullName}`);
        
        db.close();
        process.exit(0);
      });
    });
  });
});
