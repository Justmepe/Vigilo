const http = require('http');

function makeRequest(method, endpoint, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, 'http://localhost:5000');
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
          body: data,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  // Login first
  const loginRes = await makeRequest('POST', '/api/auth/login', {}, {
    username: 'admin',
    password: 'Admin123!',
  });
  const loginData = JSON.parse(loginRes.body);
  const token = loginData.token;

  console.log('Login successful, token:', token.substring(0, 20) + '...\n');

  // Submit form
  console.log('📝 Submitting JSA form...');
  const formRes = await makeRequest(
    'POST',
    '/api/forms/jsa',
    { Authorization: `Bearer ${token}` },
    {
      date: '2026-02-13',
      location: 'Test Location',
      jobTitle: 'Debug Test',
      jobDescription: 'Testing',
    }
  );

  console.log('Status:', formRes.status);
  console.log('Response:');
  console.log(formRes.body);
}

test().catch(console.error);
