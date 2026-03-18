const http = require('http');

function makeRequest(method, endpoint, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, 'http://localhost:5000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers,
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
  const loginRes = await makeRequest('POST', '/api/auth/login', {
    'Content-Type': 'application/json',
  }, {
    username: 'admin',
    password: 'Admin123!'
  });
  const loginData = JSON.parse(loginRes.body);
  const token = loginData.token;

  console.log('Forms List:');
  const res = await makeRequest('GET', '/api/forms?page=1&limit=10', {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });
  console.log('Raw response:');
  console.log(JSON.stringify(JSON.parse(res.body), null, 2).substring(0, 1000));
}

test().catch(console.error);
