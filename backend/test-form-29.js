const http = require('http');

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
    const response = JSON.parse(data);
    const token = response.token;
    
    console.log('Testing JSA form 29 PDF export...\n');
    
    const pdfOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/jsa/29/export-pdf',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const pdfReq = http.request(pdfOptions, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      
      let respData = '';
      res.on('data', (chunk) => {
        respData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ PDF generated! Size: ${respData.length} bytes`);
        } else {
          console.log(`❌ Error status: ${res.statusCode}`);
          try {
            const error = JSON.parse(respData);
            console.log('Error response:', JSON.stringify(error, null, 2));
          } catch (e) {
            console.log('Response:', respData.substring(0, 500));
          }
        }
      });
    });

    pdfReq.end();
  });
});

loginReq.write(loginData);
loginReq.end();
