const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../../database/safety_manager.db');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  try {
    // Create users table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        job_title TEXT,
        facility TEXT,
        department TEXT,
        role TEXT DEFAULT 'User',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

    // Check if admin user exists
    const adminExists = await getAsync('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (!adminExists) {
      // Hash the password
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      
      await runAsync(
        `INSERT INTO users (username, email, password_hash, full_name, job_title, facility, department, role, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin', 'admin@silverbaycatering.com', passwordHash, 'Administrator', 'Safety Manager', 'Ketchikan', 'Safety', 'Admin', 1]
      );
      console.log('✅ Admin user created (username: admin, password: Admin123!)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create other tables
    const tables = [
      `CREATE TABLE IF NOT EXISTS jsa_forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        department TEXT NOT NULL,
        job_description TEXT,
        location TEXT,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'draft',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS loto_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        facility TEXT NOT NULL,
        equipment_name TEXT NOT NULL,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'draft',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS injury_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        employee_name TEXT NOT NULL,
        date_of_injury DATETIME,
        description TEXT,
        severity TEXT,
        status TEXT DEFAULT 'draft',
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS action_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        assigned_to INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )`
    ];

    for (const table of tables) {
      await runAsync(table);
    }
    console.log('✅ All tables created');

    console.log('\n🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
});

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err && err.message.includes('already exists')) {
        resolve();
      } else if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
