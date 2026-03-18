/**
 * Claude API Verification Script
 * Tests API key and checks available models
 */

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

async function verifyClaudeAPI() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           CLAUDE API VERIFICATION TEST                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Check if API key is configured
  const apiKey = process.env.CLAUDE_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.log('❌ ERROR: No API key found!');
    console.log('   Please set CLAUDE_API_KEY in your .env file\n');
    return;
  }

  console.log('✅ API Key found');
  console.log(`   Key prefix: ${apiKey.substring(0, 20)}...`);
  console.log(`   Key length: ${apiKey.length} characters\n`);

  // Initialize Anthropic client
  const client = new Anthropic({
    apiKey: apiKey
  });

  // Test models to try
  const modelsToTest = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ];

  console.log('📋 Testing available models...\n');

  let workingModel = null;

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);

      const message = await client.messages.create({
        model: modelName,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Say "API test successful" in exactly 3 words.'
          }
        ]
      });

      const response = message.content[0].text;

      console.log(`✅ SUCCESS! Model: ${modelName}`);
      console.log(`   Response: "${response}"`);
      console.log(`   Tokens used: ${message.usage.input_tokens} in, ${message.usage.output_tokens} out\n`);

      workingModel = modelName;
      break; // Found a working model, stop testing

    } catch (error) {
      if (error.status === 404) {
        console.log(`❌ NOT AVAILABLE: ${modelName}`);
        console.log(`   Error: Model not found (404)\n`);
      } else if (error.status === 401) {
        console.log(`❌ AUTHENTICATION FAILED: ${modelName}`);
        console.log(`   Error: Invalid API key (401)\n`);
        break; // API key is invalid, stop testing
      } else if (error.status === 429) {
        console.log(`⚠️  RATE LIMITED: ${modelName}`);
        console.log(`   Error: Too many requests (429)\n`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      } else {
        console.log(`❌ ERROR: ${modelName}`);
        console.log(`   Status: ${error.status || 'Unknown'}`);
        console.log(`   Message: ${error.message}\n`);
      }
    }
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    VERIFICATION SUMMARY                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  if (workingModel) {
    console.log('✅ API VERIFICATION: SUCCESS');
    console.log(`   Working Model: ${workingModel}`);
    console.log(`   Status: API key is valid and functional\n`);

    console.log('📝 RECOMMENDATION:');
    console.log(`   Update aiReportGenerator.js line 292 to use: "${workingModel}"\n`);

    return workingModel;
  } else {
    console.log('❌ API VERIFICATION: FAILED');
    console.log('   No working models found\n');

    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('   1. Verify API key is correct (check Anthropic Console)');
    console.log('   2. Check if API key has expired');
    console.log('   3. Verify account has access to Claude models');
    console.log('   4. Check for billing/payment issues');
    console.log('   5. Try generating a new API key\n');

    console.log('📚 Resources:');
    console.log('   - Anthropic Console: https://console.anthropic.com');
    console.log('   - API Keys: https://console.anthropic.com/settings/keys');
    console.log('   - Documentation: https://docs.anthropic.com\n');

    return null;
  }
}

// Run verification
verifyClaudeAPI()
  .then(workingModel => {
    if (workingModel) {
      console.log('✨ Verification complete! Ready to generate AI reports.\n');
      process.exit(0);
    } else {
      console.log('❌ Verification failed. Please fix API configuration.\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Fatal error during verification:');
    console.error(error);
    process.exit(1);
  });
