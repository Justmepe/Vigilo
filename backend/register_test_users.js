#!/usr/bin/env node
/**
 * User registration helper - create test users
 */

const http = require('http');

const users = [
  {
    username: 'jhoniel254',
    email: 'jhoniel@test.com',
    password: 'Test123!',
    full_name: 'Jhoniel Test User',
    job_title: 'Safety Officer',
    facility: 'Main Facility',
    department: 'Safety'
  },
  {
    username: 'testuser',
    email: 'test@test.com',
    password: 'Test123!',
    full_name: 'Test User',
    job_title: 'Inspector',
    facility: 'Test Facility',
    department: 'Inspection'
  }
];

let currentIndex = 0;

function registerUser(user) {
  console.log(`\n📝 Registering user: ${user.username}...`);
  
  const userData = JSON.stringify(user);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.message && result.message.includes('successfully')) {
          console.log(`✅ User registered: ${user.username}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Password: ${user.password}`);
          currentIndex++;
          if (currentIndex < users.length) {
            registerUser(users[currentIndex]);
          } else {
            console.log('\n✨ All users registered successfully!');
            console.log('\n📋 Available Test Accounts:');
            users.forEach((u, i) => {
              console.log(`\n   ${i + 1}. ${u.username}`);
              console.log(`      Email: ${u.email}`);
              console.log(`      Password: ${u.password}`);
            });
            console.log('\n   Admin Account:');
            console.log(`   Username: admin`);
            console.log(`   Password: Admin123!`);
            process.exit(0);
          }
        } else if (result.error?.includes('already')) {
          console.log(`⚠️  User already exists: ${user.username}`);
          currentIndex++;
          if (currentIndex < users.length) {
            registerUser(users[currentIndex]);
          } else {
            process.exit(0);
          }
        } else {
          console.error(`❌ Registration failed:`, result);
          process.exit(1);
        }
      } catch (e) {
        console.error('❌ Registration error:', e.message);
        process.exit(1);
      }
    });
  });

  req.on('error', err => {
    console.error('❌ Request error:', err);
    process.exit(1);
  });

  req.write(userData);
  req.end();
}

registerUser(users[0]);
