#!/usr/bin/env node
const db = require('sqlite3').verbose().Database;
const path = require('path');
const dbPath = path.join(__dirname, '../database/safety_manager.db');
const dbConnection = new db(dbPath);

console.log('\n📋 Users in Database:\n');

dbConnection.all('SELECT id, username, email, full_name, job_title, is_active FROM users', (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    if (rows && rows.length > 0) {
      rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.full_name}`);
        console.log(`   Job Title: ${user.job_title}`);
        console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('No users found in database');
    }
  }
  dbConnection.close();
});
