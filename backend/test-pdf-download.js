/**
 * Complete PDF Export Test - Create Form & Download PDF
 * Full end-to-end test of the PDF export functionality
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production-min-32-chars';

// Create a valid JWT token
const TEST_TOKEN = jwt.sign(
  { id: 1, username: 'test', email: 'test@test.com', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Test JSA form data
const testJSAForm = {
  workArea: 'Machine Shop - Production Line A',
  jobTitle: 'Metal Cutting & Assembly',
  date: new Date().toISOString().split('T')[0],
  preparedBy: 'John Smith',
  department: 'Manufacturing',
  processDescription: 'Cutting and assembling metal parts for final product',
  hazards: [
    { hazard: 'Sharp edges on metal parts', risk: 'High', control: 'Use cut-resistant gloves' },
    { hazard: 'Rotating machinery', risk: 'High', control: 'Keep hands clear of rotating parts' },
    { hazard: 'Noise exposure', risk: 'Medium', control: 'Wear hearing protection' }
  ],
  supervisorName: 'Jane Doe',
  safetyReviewed: true
};

function makeRequest(method, urlPath, data = null, token = TEST_TOKEN) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runFullTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     FULL PDF EXPORT TEST - Create Form & Download PDF          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting against: ${BASE_URL}`);
  console.log(`Using auth token: ${TEST_TOKEN.substring(0, 30)}...\n`);

  try {
    // Step 1: Create a JSA form
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Creating JSA Safety Form');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const createResponse = await makeRequest('POST', '/api/jsa', testJSAForm);
    console.log(`Response Status: ${createResponse.statusCode}`);
    
    let formId = null;
    let formData = null;

    if (createResponse.statusCode === 201 || createResponse.statusCode === 200) {
      try {
        formData = JSON.parse(createResponse.body);
        formId = formData.data?.id || formData.id || formData._id;
        console.log(`✓ Form created successfully`);
        console.log(`✓ Form ID: ${formId}`);
        console.log(`✓ Response: ${JSON.stringify(formData).substring(0, 100)}...\n`);
      } catch (e) {
        console.log(`Response: ${createResponse.body.substring(0, 200)}...\n`);
      }
    } else {
      console.log(`❌ Failed to create form: ${createResponse.statusCode}`);
      console.log(`Response: ${createResponse.body.substring(0, 200)}...\n`);
    }

    // Step 2: List forms to get a valid ID if creation failed
    if (!formId) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('STEP 2: Fetching existing forms');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const listResponse = await makeRequest('GET', '/api/jsa');
      console.log(`Response Status: ${listResponse.statusCode}`);

      if (listResponse.statusCode === 200) {
        try {
          const forms = JSON.parse(listResponse.body);
          if (Array.isArray(forms) && forms.length > 0) {
            formId = forms[0].id || forms[0]._id;
            console.log(`✓ Found ${forms.length} existing form(s)`);
            console.log(`✓ Using form ID: ${formId}\n`);
          } else if (forms.data && Array.isArray(forms.data)) {
            if (forms.data.length > 0) {
              formId = forms.data[0].id || forms.data[0]._id;
              console.log(`✓ Found ${forms.data.length} existing form(s)`);
              console.log(`✓ Using form ID: ${formId}\n`);
            }
          }
        } catch (e) {
          console.log(`Error parsing response: ${e.message}\n`);
        }
      }
    }

    // Step 3: Download PDF
    if (formId) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('STEP 3: Downloading PDF Report');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log(`Requesting: /api/jsa/${formId}/export-pdf`);
      console.log(`With Authorization: Bearer ${TEST_TOKEN.substring(0, 20)}...\n`);

      const pdfResponse = await makeRequest('GET', `/api/jsa/${formId}/export-pdf`, null, TEST_TOKEN);

      console.log(`Response Status: ${pdfResponse.statusCode}`);
      console.log(`Content-Type: ${pdfResponse.headers['content-type']}`);
      console.log(`Content Length: ${pdfResponse.body.length} bytes\n`);

      if (pdfResponse.statusCode === 200 && pdfResponse.headers['content-type']?.includes('pdf')) {
        // Save PDF
        const outputPath = path.join(__dirname, 'test-output.pdf');
        fs.writeFileSync(outputPath, pdfResponse.body, 'binary');
        
        console.log('✓ PDF downloaded successfully!');
        console.log(`✓ Saved to: ${outputPath}\n`);

        // Show file size
        const stats = fs.statSync(outputPath);
        console.log(`✓ File size: ${(stats.size / 1024).toFixed(2)} KB\n`);

        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║                   ✅  TEST PASSED  ✅                          ║');
        console.log('║                                                                ║');
        console.log('║  PDF Export with Authorization Header is WORKING!             ║');
        console.log('║  The 401 error from before has been FIXED                     ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        return true;

      } else if (pdfResponse.statusCode === 401) {
        console.log('❌ 401 Unauthorized - Authorization header not accepted');
        console.log(`Response: ${pdfResponse.body.substring(0, 200)}\n`);
        return false;

      } else {
        console.log(`❌ Failed to download PDF (Status: ${pdfResponse.statusCode})`);
        console.log(`Response: ${pdfResponse.body.substring(0, 200)}\n`);
        return false;
      }

    } else {
      console.log('❌ Could not find a form to test PDF export\n');
      return false;
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
    return false;
  }
}

// Run the test
runFullTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
