#!/usr/bin/env node
/**
 * Test All Form Types - Submission & PDF Export
 */

const http = require('http');
const fs = require('fs');

const API_URL = 'http://localhost:5000';
let authToken = '';

function makeRequest(method, endpoint, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Form test configurations
const formTests = [
  {
    name: 'JSA (Job Safety Analysis)',
    endpoint: '/api/jsa',
    data: {
      date: '2026-02-13',
      location: 'Test Location',
      jobTitle: 'Safety Test Job',
      jobDescription: 'Testing JSA form submission',
    }
  },
  {
    name: 'LOTO (Lockout/Tagout)',
    endpoint: '/api/loto',
    data: {
      date: '2026-02-13',
      equipmentName: 'Test Equipment',
      authorizedBy: 'John Doe',
      location: 'Test Location',
      description: 'Testing LOTO form',
    }
  },
  {
    name: 'Injury Report',
    endpoint: '/api/injury',
    data: {
      incidentDate: '2026-02-13',
      location: 'Test Location',
      employeeName: 'John Doe',
      description: 'Testing Injury form',
    }
  },
  {
    name: 'Accident Report',
    endpoint: '/api/accident',
    data: {
      date: '2026-02-13',
      location: 'Test Location',
      type: 'Other',
      description: 'Testing Accident form',
    }
  },
  {
    name: 'Spill Report',
    endpoint: '/api/spill',
    data: {
      date: '2026-02-13',
      location: 'Test Location',
      chemicalName: 'Test Chemical',
      quantity: '1 liter',
      description: 'Testing Spill form',
    }
  },
  {
    name: 'Monthly Inspection',
    endpoint: '/api/inspection',
    data: {
      date: '2026-02-13',
      area: 'Test Area',
      inspectorName: 'John Doe',
      findings: 'Testing monthly inspection form',
    }
  },
];

async function runTests() {
  console.log('🧪 TESTING ALL FORM TYPES\n');
  console.log('═'.repeat(70) + '\n');

  try {
    // Step 1: Login
    console.log('📝 Step 1: Authentication\n');
    const loginRes = await makeRequest('POST', '/api/auth/login', {}, {
      username: 'admin',
      password: 'Admin123!',
    });
    const loginData = JSON.parse(loginRes.body);
    
    if (!loginData.token) {
      console.error('❌ Login failed');
      process.exit(1);
    }
    
    authToken = loginData.token;
    console.log('✅ Logged in as admin\n');

    // Step 2: Test each form type
    console.log('📝 Step 2: Testing Form Submissions\n');
    const results = [];

    for (const form of formTests) {
      console.log(`Testing: ${form.name}`);
      console.log('─'.repeat(70));

      // Submit form
      const submitRes = await makeRequest(
        'POST',
        form.endpoint,
        { Authorization: `Bearer ${authToken}` },
        form.data
      );

      if (submitRes.status !== 200 && submitRes.status !== 201) {
        console.log(`❌ FAILED - Status ${submitRes.status}`);
        console.log(`   Response: ${submitRes.body.substring(0, 200)}\n`);
        results.push({ name: form.name, submitted: false, pdf: false });
        continue;
      }

      const formData = JSON.parse(submitRes.body);
      const formId = formData.id;

      if (!formId) {
        console.log(`❌ FAILED - No form ID returned`);
        console.log(`   Response: ${JSON.stringify(formData).substring(0, 200)}\n`);
        results.push({ name: form.name, submitted: false, pdf: false });
        continue;
      }

      console.log(`✅ Form submitted - ID: ${formId}`);

      // Export PDF
      const pdfRes = await makeRequest(
        'GET',
        `/api/forms/${formId}/export-pdf`,
        { Authorization: `Bearer ${authToken}` }
      );

      let pdfSuccess = false;
      if (pdfRes.status === 200 && pdfRes.headers['content-type'] === 'application/pdf') {
        console.log(`✅ PDF exported - ${Buffer.byteLength(pdfRes.body)} bytes`);
        pdfSuccess = true;
      } else {
        console.log(`❌ PDF export failed - Status ${pdfRes.status}`);
      }

      console.log();
      results.push({ 
        name: form.name, 
        submitted: true, 
        pdf: pdfSuccess,
        id: formId
      });
    }

    // Step 3: Verify in database
    console.log('\n📝 Step 3: Database Verification\n');
    const dbRes = await makeRequest(
      'GET',
      '/api/forms?page=1&limit=20',
      { Authorization: `Bearer ${authToken}` }
    );
    const dbData = JSON.parse(dbRes.body);
    const totalForms = dbData.data.pagination.total;
    
    console.log(`✅ Database check: ${totalForms} total forms stored\n`);

    // Summary
    console.log('═'.repeat(70));
    console.log('\n📊 TEST SUMMARY\n');
    
    let allSubmitted = true;
    let allPdfs = true;

    results.forEach(r => {
      const submitStatus = r.submitted ? '✅' : '❌';
      const pdfStatus = r.pdf ? '✅' : '❌';
      console.log(`${submitStatus} ${r.name.padEnd(25)} ${pdfStatus} PDF`);
      if (!r.submitted) allSubmitted = false;
      if (!r.pdf) allPdfs = false;
    });

    console.log('\n' + '═'.repeat(70));
    
    if (allSubmitted && allPdfs) {
      console.log('\n✨ SUCCESS: ALL FORMS SUBMITTING AND GENERATING PDFS\n');
    } else if (allSubmitted) {
      console.log('\n⚠️  WARNING: All forms submit but some PDFs failed\n');
    } else {
      console.log('\n❌ ERROR: Some forms failed to submit\n');
    }

    // List inspection forms specifically
    console.log('📋 Detailed Check - Recent Forms in Database:\n');
    dbData.data.forms.slice(0, 5).forEach(f => {
      console.log(`  ID ${f.id}: ${f.formType.padEnd(12)} | ${f.createdAt.split('T')[0]}`);
    });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

runTests();
