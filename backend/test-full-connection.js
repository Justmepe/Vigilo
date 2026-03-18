#!/usr/bin/env node
/**
 * Complete Frontend-Backend Connection Test
 * Tests the full workflow from frontend login to PDF download
 */

const http = require('http');

console.log('🔍 Testing Frontend-Backend Connection\n');

// Step 1: Login to get token
console.log('Step 1️⃣: Getting authentication token...');

const loginData = JSON.stringify({
  username: 'admin',
  password: 'Admin123!'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.token) {
        console.log('✅ Login successful!\n');
        const token = response.token;
        
        // Step 2: Get list of forms
        console.log('Step 2️⃣: Getting list of inspection forms...\n');
        getFormsList(token);
      } else {
        console.log('❌ Login failed - no token returned');
        console.log('Response:', response);
      }
    } catch (e) {
      console.log('❌ Failed to parse login response:', e.message);
      console.log('Response:', data.substring(0, 200));
    }
  });
});

loginReq.on('error', (e) => {
  console.error('❌ Login request failed:', e.message);
  console.error('\n⚠️ Make sure backend server is running:');
  console.error('   cd backend');
  console.error('   npm install');
  console.error('   npm start');
});

loginReq.write(loginData);
loginReq.end();

function getFormsList(token) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/inspection',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        let forms = [];
        if (Array.isArray(response)) {
          forms = response;
        } else if (response.data && Array.isArray(response.data.forms)) {
          forms = response.data.forms;
        }
        
        if (forms && forms.length > 0) {
          const formId = forms[0].id;
          const formType = forms[0].form_type || 'inspection';
          
          console.log(`✅ Found ${forms.length} forms`);
          console.log(`📋 Testing with form ID: ${formId}, type: ${formType}\n`);
          
          // Step 3: Download PDF
          console.log('Step 3️⃣: Downloading PDF from backend...\n');
          downloadPDF(token, formType, formId);
        } else {
          console.log('❌ No forms found in database');
          console.log('Response:', response);
        }
      } catch (e) {
        console.log('❌ Failed to parse forms response:', e.message);
        console.log('Response:', data.substring(0, 300));
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Get forms request failed:', e.message);
  });

  req.end();
}

function downloadPDF(token, formType, formId) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/${formType}/${formId}/export-pdf`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`  Status Code: ${res.statusCode}`);
    console.log(`  Content-Type: ${res.headers['content-type']}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`  PDF Size: ${data.length} bytes`);
        console.log('\n✅ PDF download successful!\n');
        
        console.log('═══════════════════════════════════════════');
        console.log('✨ FULL BACKEND CONNECTION TEST PASSED! ✨');
        console.log('═══════════════════════════════════════════\n');
        
        console.log('✅ Backend server is running and responsive');
        console.log('✅ Authentication is working correctly');
        console.log('✅ PDF export endpoint is functional');
        console.log('✅ PDF generation is working\n');
        
        console.log('Next steps:');
        console.log('1️⃣ Start the frontend: cd frontend && npm install && npm start');
        console.log('2️⃣ Open http://localhost:3000 in your browser');
        console.log('3️⃣ Login with username: "admin" and password: "Admin123!"');
        console.log('4️⃣ Click Download PDF button on any form\n');
      } else {
        console.log(`❌ PDF export failed with status ${res.statusCode}`);
        
        try {
          const errorResponse = JSON.parse(data);
          console.log('\nError details:');
          console.log(JSON.stringify(errorResponse, null, 2));
        } catch (e) {
          console.log('\nResponse:', data.substring(0, 500));
        }
        
        if (res.statusCode === 401) {
          console.log('❌ Authentication failed - token may be invalid');
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ PDF request failed: ${e.message}`);
  });

  req.end();
}
