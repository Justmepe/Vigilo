const http = require('http');

// Get a token by logging in
const loginData = JSON.stringify({
  username: 'admin',
  password: 'Admin123!'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Login Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Login Response:', JSON.stringify(response, null, 2));
      
      if (response.token) {
        console.log('\n✅ Token obtained:', response.token.substring(0, 50) + '...');
        
        // Now try using this token to download PDF
        testPDFDownload(response.token);
      } else {
        console.log('❌ No token in response');
      }
    } catch (e) {
      console.log('Response:', data.substring(0, 300));
    }
  });
});

req.on('error', (e) => {
  console.error(`Login request error: ${e.message}`);
});

req.write(loginData);
req.end();

function testPDFDownload(token) {
  const pdfOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/inspection/1/export-pdf',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const pdfReq = http.request(pdfOptions, (res) => {
    console.log(`\nPDF Status: ${res.statusCode}`);
    
    let dataSize = 0;
    res.on('data', (chunk) => {
      dataSize += chunk.length;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`✅ PDF downloaded! Size: ${dataSize} bytes`);
        console.log('✅ PDF export endpoint is working!');
      } else {
        console.log(`❌ PDF endpoint returned status ${res.statusCode}`);
      }
    });
  });

  pdfReq.on('error', (e) => {
    console.error(`PDF request error: ${e.message}`);
  });

  pdfReq.end();
}
