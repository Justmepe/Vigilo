#!/usr/bin/env node
/**
 * Test Login API
 */

const http = require('http');

const testCases = [
  {
    name: 'Valid admin login',
    username: 'admin',
    password: 'Admin123!',
    shouldSucceed: true
  },
  {
    name: 'Wrong password',
    username: 'admin',
    password: 'WrongPassword123!',
    shouldSucceed: false
  },
  {
    name: 'Non-existent user',
    username: 'jhoniel254',
    password: 'Test123!',
    shouldSucceed: false
  },
  {
    name: 'Empty credentials',
    username: '',
    password: '',
    shouldSucceed: false
  }
];

let currentTest = 0;

function runTest(testCase) {
  console.log(`\n🧪 Test: ${testCase.name}`);
  console.log(`   Username: ${testCase.username}`);
  console.log(`   Password: ${testCase.password}`);
  
  const loginData = JSON.stringify({
    username: testCase.username,
    password: testCase.password
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        if (testCase.shouldSucceed) {
          if (result.token) {
            console.log(`   ✅ PASS - Login successful`);
            console.log(`      Token: ${result.token.substring(0, 30)}...`);
            console.log(`      User: ${result.user.username} (${result.user.full_name})`);
          } else {
            console.log(`   ❌ FAIL - Expected success but got error: ${result.error?.message}`);
          }
        } else {
          if (result.error) {
            console.log(`   ✅ PASS - Login correctly rejected`);
            console.log(`      Error: ${result.error.message}`);
          } else {
            console.log(`   ❌ FAIL - Expected failure but login succeeded`);
          }
        }
      } catch (e) {
        console.log(`   ❌ ERROR parsing response: ${e.message}`);
      }
      
      currentTest++;
      if (currentTest < testCases.length) {
        setTimeout(() => runTest(testCases[currentTest]), 500);
      } else {
        console.log('\n✨ All tests completed!\n');
        process.exit(0);
      }
    });
  });

  req.on('error', err => {
    console.error('❌ Request error:', err.message);
    process.exit(1);
  });

  req.write(loginData);
  req.end();
}

console.log('🔐 Login API Test Suite');
console.log('='.repeat(60));

runTest(testCases[0]);
