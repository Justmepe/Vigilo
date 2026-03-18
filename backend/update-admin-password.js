const bcrypt = require('bcrypt');
const db = require('./src/config/database');

const password = 'Admin123!';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.log('Hashing error:', err);
    db.close();
    return;
  }
  
  console.log('New password hash:', hash);
  
  // Update the admin user's password
  db.run(
    "UPDATE users SET password_hash = ? WHERE username = 'admin'",
    [hash],
    function(err) {
      if (err) {
        console.log('Update error:', err);
      } else {
        console.log('✅ Admin password updated');
      }
      db.close();
    }
  );
});
