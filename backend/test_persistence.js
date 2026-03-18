#!/usr/bin/env node
/**
 * Test script to verify form persistence to database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const DB_PATH = '../database/safety_manager.db';

// Helper function to make HTTP requests
const httpPost = (url, data, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = new URL(url);
    const http = require('http');
    const postData = JSON.stringify(data);
    
    const requestOptions = {
      hostname: options.hostname,
      port: options.port,
      path: options.pathname + options.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

const httpGet = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = new URL(url);
    const http = require('http');
    
    const requestOptions = {
      hostname: options.hostname,
      port: options.port,
      path: options.pathname + options.search,
      method: 'GET',
      headers: {
        ...headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Get database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

async function testFormPersistence() {
  try {
    console.log('\n📋 Testing Form Persistence...\n');

    // 0. Login to get token
    console.log('0️⃣ Logging in...');
    const loginResponse = await httpPost(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });
    
    if (!loginResponse.token) {
      console.log('   ❌ Login failed:', loginResponse);
      throw new Error('Authentication failed');
    }
    
    const token = loginResponse.token;
    console.log(`   ✅ Authenticated with token: ${token.substring(0, 20)}...`);
    
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Get current form count
    console.log('\n1️⃣ Getting initial form count...');
    const getCount = () => new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM forms', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const initialCount = await getCount();
    console.log(`   Initial forms in database: ${initialCount}`);

    // 2. Submit a JSA form
    console.log('\n2️⃣ Submitting JSA form...');
    const jsaData = {
      date: '2026-02-13',
      location: 'Warehouse A',
      jobTitle: 'Material Handling',
      jobDescription: 'Moving boxes and pallets',
      preparedBy: 'John Doe',
      contactNumber: '555-0100'
    };

    const jsaResponse = await httpPost(`${API_URL}/jsa`, jsaData, headers);
    console.log(`   ✅ JSA Response:`, jsaResponse);
    const jsaFormId = jsaResponse.id;
    console.log(`   Form ID: ${jsaFormId}`);

    // 3. Verify in database
    console.log('\n3️⃣ Verifying in database...');
    const getForm = (id) => new Promise((resolve, reject) => {
      db.get('SELECT id, form_type, form_data, status, created_at FROM forms WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const savedForm = await getForm(jsaFormId);
    if (savedForm) {
      console.log(`   ✅ Found form in database!`);
      console.log(`   ID: ${savedForm.id}`);
      console.log(`   Type: ${savedForm.form_type}`);
      console.log(`   Status: ${savedForm.status}`);
      console.log(`   Created: ${savedForm.created_at}`);
      const formData = JSON.parse(savedForm.form_data);
      console.log(`   Location: ${formData.location}`);
      console.log(`   Job Title: ${formData.jobTitle}`);
    } else {
      console.log(`   ❌ Form NOT found in database!`);
    }

    // 4. Get updated count
    console.log('\n4️⃣ Checking updated form count...');
    const finalCount = await getCount();
    console.log(`   Final forms in database: ${finalCount}`);
    console.log(`   Added: ${finalCount - initialCount} form(s)`);

    if (finalCount === initialCount + 1) {
      console.log('\n✅ SUCCESS: Form was persisted to database!');
    } else {
      console.log('\n❌ FAILURE: Form count did not increase!');
    }

    // 5. Test Injury form
    console.log('\n5️⃣ Testing Injury form...');
    const injuryData = {
      date: '2026-02-13',
      location: 'Factory Floor',
      description: 'Cut on hand',
      employeeName: 'Jane Smith'
    };

    const injuryResponse = await httpPost(`${API_URL}/injury`, injuryData, headers);
    console.log(`   ✅ Injury form submitted with ID: ${injuryResponse.id}`);

    const injuryForm = await getForm(injuryResponse.data.id);
    if (injuryForm) {
      console.log(`   ✅ Injury form found in database!`);
    } else {
      console.log(`   ❌ Injury form NOT found in database!`);
    }

    // 6. Test retrieval endpoint
    console.log('\n6️⃣ Testing GET /api/forms endpoint...');
    const listResponse = await httpGet(`${API_URL}/forms?limit=10`, headers);
    console.log(`   ✅ Retrieved forms list:`);
    console.log(`   Total forms: ${listResponse.data.pagination.total}`);
    console.log(`   Page forms: ${listResponse.data.forms.length}`);
    if (listResponse.data.forms.length > 0) {
      console.log(`   Sample form:`, listResponse.data.forms[0]);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    db.close();
    process.exit(0);
  }
}

testFormPersistence();
