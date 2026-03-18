const db = require('./src/config/database');

db.all("PRAGMA table_info(users)", (err, columns) => {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Users table columns:', columns.map(c => c.name));
  }
  
  db.all("SELECT id, email FROM users LIMIT 3", (err, rows) => {
    if (err) {
      console.log('Error:', err.message);
    } else {
      console.log('Users found:', rows);
    }
    db.close();
  });
});
