const http = require('http');

// First, let's create a user token for auth
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/inspection/1/export-pdf',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test-token-12345'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`✅ PDF returned! Size: ${data.length} bytes`);
      console.log('First 100 chars:', data.substring(0, 100));
    } else {
      console.log('Response:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
