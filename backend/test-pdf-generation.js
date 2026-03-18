/**
 * Test PDF Generation with AI Report
 * Tests the complete flow: form submission → AI report generation → PDF export
 */

const axios = require('axios');
const fs = require('fs');

// Start test
const baseURL = 'http://localhost:3000';

async function testPDFGeneration() {
  try {
    console.log('🧪 Testing PDF Generation with AI Report\n');

    // Test form data
    const testForm = {
      formType: 'jsa',
      formData: {
        date: new Date().toISOString().split('T')[0],
        location: 'Seafood Processing Plant - Area A',
        jobTitle: 'Fish Filleting',
        jobDescription: 'Cleaning and filleting fresh fish',
        jobSteps: [
          {
            jobStep: 'Receive fish from conveyor',
            hazardsIdentified: 'Sharp knives, fast-moving conveyor',
            controlMeasures: 'Use cut-resistant gloves, maintain focus'
          },
          {
            jobStep: 'Fillet fish with knife',
            hazardsIdentified: 'Cut hazard, blood exposure',
            controlMeasures: 'Proper knife handling, use bandages for cuts'
          }
        ],
        workTeamMembers: [
          {
            classification: 'Fish Fillet Operator',
            personalProtection: 'Cut-resistant gloves, apron, steel-toed boots',
            plantEquipmentTools: 'Filleting knife, cutting board, scale'
          }
        ],
        ppeRequired: ['Cut-resistant gloves', 'Apron', 'Steel-toed boots', 'Hair net'],
        commonHazards: ['Sharp knives', 'Wet floors', 'Cold temperatures'],
        commonControls: ['Proper training', 'Equipment maintenance', 'Good housekeeping']
      }
    };

    console.log('1️⃣ Submitting form...');
    const submitRes = await axios.post(`${baseURL}/api/jsa`, testForm);
    const formId = submitRes.data.data.formId;
    console.log(`   ✅ Form submitted: ${formId}\n`);

    // Wait for AI report generation
    console.log('2️⃣ Waiting for AI report generation (5-10 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    console.log('   ✅ Wait complete\n');

    // Export PDF
    console.log('3️⃣ Exporting PDF with AI report...');
    const pdfRes = await axios.get(
      `${baseURL}/api/jsa/${formId}/export-pdf`,
      { responseType: 'arraybuffer' }
    );
    
    const pdfBuffer = Buffer.from(pdfRes.data);
    const pdfPath = `TEST-REPORT-${formId}.pdf`;
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    console.log(`   ✅ PDF exported: ${pdfPath} (${pdfBuffer.length} bytes)\n`);

    // Verify PDF content
    console.log('4️⃣ Verifying PDF content...');
    const content = pdfBuffer.toString('latin1');
    
    const checks = [
      { name: 'AI Report section', check: content.includes('SAFETY ANALYSIS REPORT') },
      { name: 'Footer', check: content.includes('Document Control') },
      { name: 'Page numbers', check: content.includes('Page') },
      { name: 'Job steps table', check: content.includes('JOB STEP') || content.includes('FILLET') },
      { name: 'Team members section', check: content.includes('WORK TEAM MEMBERS') }
    ];

    let allPassed = true;
    checks.forEach(({ name, check }) => {
      const status = check ? '✅' : '❌';
      console.log(`   ${status} ${name}: ${check ? 'Found' : 'Not found'}`);
      if (!check) allPassed = false;
    });

    console.log('\n' + (allPassed ? '✅ All checks passed!' : '❌ Some checks failed'));
    console.log(`\n📄 PDF saved to: ${pdfPath}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

// Run test
testPDFGeneration();
