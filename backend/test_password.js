#!/usr/bin/env node
// Test password hash
const bcrypt = require('bcrypt');

const storedHash = '$2b$10$BsQcPTcfF0T2FLB0S0M8M.2j8KvKL8KwKUqsEfTRvZ0K6VQQy8lPu';
const password = 'Admin123!';

bcrypt.compare(password, storedHash, (err, isValid) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(`Password "${password}" matches hash:`, isValid);
  }
  process.exit(0);
});
