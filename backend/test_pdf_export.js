#!/usr/bin/env node
/**
 * Test PDF Export API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

let token = '';
let formId = null;

// Step 1: Login
console.log('📝 Step 1: Logging in as admin...');
const loginData = JSON.stringify({ username: 'admin', password: 'Admin123!' });

const loginReq = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.token) {
      token = result.token;
      console.log('✅ Logged in');
      submitForm();
    } else {
      console.error('❌ Login failed');
      process.exit(1);
    }
  });
});

loginReq.write(loginData);
loginReq.end();

// Step 2: Submit a form
function submitForm() {
  console.log('\n📝 Step 2: Submitting JSA form...');
  
  const jsaData = JSON.stringify({
    date: '2026-02-13',
    location: 'Test Location',
    jobTitle: 'PDF Export Test',
    jobDescription: 'Testing PDF generation'
  });

  const jsaReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/jsa',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(jsaData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.success) {
        formId = result.id;
        console.log(`✅ Form submitted - ID: ${formId}`);
        setTimeout(() => exportPDF(), 500);
      } else {
        console.error('❌ Form submission failed');
        process.exit(1);
      }
    });
  });

  jsaReq.write(jsaData);
  jsaReq.end();
}

// Step 3: Export PDF
function exportPDF() {
  console.log(`\n📝 Step 3: Exporting form ${formId} as PDF...`);
  
  const pdfReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/forms/${formId}/export-pdf`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    console.log(`   Response Status: ${res.statusCode}`);
    console.log(`   Content-Type: ${res.headers['content-type']}`);

    if (res.statusCode === 200 && res.headers['content-type']?.includes('pdf')) {
      // PDF received successfully
      const pdfPath = path.join(__dirname, `test-form-${formId}.pdf`);
      const file = fs.createWriteStream(pdfPath);
      
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ PDF generated and saved to: ${pdfPath}`);
        console.log('\n✨ PDF export is working!\n');
        process.exit(0);
      });
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`❌ PDF export failed: ${result.error?.message || 'Unknown error'}`);
        } catch (e) {
          console.log(`❌ PDF export failed: ${data}`);
        }
        process.exit(1);
      });
    }
  });

  pdfReq.on('error', err => {
    console.error('❌ Request error:', err.message);
    process.exit(1);
  });

  pdfReq.end();
}
