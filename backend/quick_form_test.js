#!/usr/bin/env node
/**
 * Quick end-to-end form submission test
 */

const http = require('http');

let token = '';

// Step 1: Login
console.log('📝 Step 1: Logging in as admin...');
const loginData = JSON.stringify({ username: 'admin', password: 'Admin123!' });
const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.token) {
        token = result.token;
        console.log('✅ Logged in successfully');
        submitJSAForm();
      } else {
        console.error('❌ Login failed:', result);
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Login error:', e.message);
      process.exit(1);
    }
  });
});

loginReq.on('error', err => {
  console.error('❌ Login request error:', err);
  process.exit(1);
});

loginReq.write(loginData);
loginReq.end();

// Step 2: Submit JSA Form
function submitJSAForm() {
  console.log('\n📝 Step 2: Submitting JSA form...');
  
  const jsaData = JSON.stringify({
    date: '2026-02-13',
    location: 'Safety Test Location',
    jobTitle: 'Testing Safety System',
    jobDescription: 'End-to-end form persistence test',
    preparedBy: 'Test User'
  });

  const jsaOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/jsa',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(jsaData)
    }
  };

  const jsaReq = http.request(jsaOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ JSA form submitted successfully');
          console.log(`   Form ID: ${result.id}`);
          console.log(`   Message: ${result.message}`);
          retrieveFormList();
        } else {
          console.error('❌ Form submission failed:', result);
          process.exit(1);
        }
      } catch (e) {
        console.error('❌ Form submission error:', e.message);
        process.exit(1);
      }
    });
  });

  jsaReq.on('error', err => {
    console.error('❌ Form submission error:', err);
    process.exit(1);
  });

  jsaReq.write(jsaData);
  jsaReq.end();
}

// Step 3: Retrieve Forms List
function retrieveFormList() {
  console.log('\n📝 Step 3: Retrieving submitted forms...');
  
  const listOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/forms?limit=10',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const listReq = http.request(listOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ Forms list retrieved successfully');
          console.log(`   Total forms: ${result.data.pagination.total}`);
          console.log(`   Forms on page: ${result.data.forms.length}`);
          
          if (result.data.forms.length > 0) {
            console.log('\n📋 Recent Forms:');
            result.data.forms.slice(0, 3).forEach((form, i) => {
              console.log(`   ${i + 1}. ID: ${form.id}, Type: ${form.formType}, Status: ${form.status}`);
            });
          }
          
          console.log('\n✨ All systems operational! Forms are persisting to database.');
          process.exit(0);
        } else {
          console.error('❌ Failed to retrieve forms:', result);
          process.exit(1);
        }
      } catch (e) {
        console.error('❌ Retrieval error:', e.message);
        process.exit(1);
      }
    });
  });

  listReq.on('error', err => {
    console.error('❌ Retrieval error:', err);
    process.exit(1);
  });

  listReq.end();
}
