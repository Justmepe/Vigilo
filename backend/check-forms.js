const db = require('./src/config/database');

db.all("PRAGMA table_info(forms)", (err, columns) => {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Forms table columns:', columns.map(c => c.name));
  }
  
  db.all("SELECT * FROM forms LIMIT 1", (err, rows) => {
    if (err) {
      console.log('Error:', err.message);
    } else {
      console.log('Sample form:', rows[0]);
    }
    db.close();
  });
});
