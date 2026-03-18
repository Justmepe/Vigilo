const http = require('http');

// Login and get token, then test form 1
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
        const token = response.token;
        console.log('✅ Login successful!\n');
        
        // Test with form 1 which we know exists
        console.log('Testing PDF export for form 1 (inspection type)...\n');
        testPDF(token, 'inspection', 1);
      } else {
        console.log('❌ Login failed');
      }
    } catch (e) {
      console.log('❌ Login error:', e.message);
    }
  });
});

loginReq.write(loginData);
loginReq.end();

function testPDF(token, formType, formId) {
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
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`✅ PDF generated! Size: ${data.length} bytes`);
        console.log('\n✨ Success! Backend is working properly.\n');
        console.log('To fix frontend PDF downloads:');
        console.log('1️⃣ Start frontend: cd frontend && npm start');
        console.log('2️⃣ Login with admin / Admin123!');
        console.log('3️⃣ Click Download PDF button\n');
      } else {
        console.log(`❌ Error: ${res.statusCode}`);
        try {
          const err = JSON.parse(data);
          console.log('Error details:', err);
        } catch (e) {
          console.log('Response:', data.substring(0, 300));
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.end();
}
