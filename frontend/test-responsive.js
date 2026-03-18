const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const viewports = [
  { name: 'Mobile-iPhone-SE', width: 375, height: 667 },
  { name: 'Mobile-iPhone-12', width: 390, height: 844 },
  { name: 'Mobile-Android', width: 412, height: 915 },
  { name: 'Tablet-iPad', width: 768, height: 1024 },
  { name: 'Desktop-1024', width: 1024, height: 768 },
  { name: 'Desktop-1440', width: 1440, height: 900 },
  { name: 'Desktop-1920', width: 1920, height: 1080 },
];

const appUrl = 'http://localhost:3000';
const credentials = { username: 'admin', password: 'Admin123!' };

async function runTests() {
  console.log('🚀 Starting E2E Tests with Screenshots');
  console.log(`📸 Screenshots will be saved to: ${screenshotDir}\n`);

  const browser = await puppeteer.launch({
    headless: false, // Show browser
    defaultViewport: null,
  });

  const page = await browser.newPage();
  let screenshotCount = 1;

  const takeScreenshot = async (name, stepName) => {
    const filename = `${String(screenshotCount).padStart(2, '0')}-${name}-${stepName}.png`;
    const filepath = path.join(screenshotDir, filename);
    await page.screenshot({ path: filepath });
    console.log(`✅ Screenshot ${screenshotCount}: ${name} - ${stepName}`);
    screenshotCount++;
  };

  try {
    // Test 1: Load login page
    console.log('\n📱 Test 1: Login Page');
    await page.goto(appUrl, { waitUntil: 'networkidle2' });
    await takeScreenshot('01-login', 'initial-page');
    
    // Test 2: Login
    console.log('\n🔐 Test 2: User Login');
    await page.type('input[type="text"]', credentials.username);
    await page.type('input[type="password"]', credentials.password);
    await page.click('button');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot('02-dashboard', 'after-login');

    // Test 3: Desktop responsive test
    console.log('\n🖥️  Test 3: Desktop Resolution Tests');
    for (const viewport of viewports.filter(v => v.width >= 1024)) {
      console.log(`  Testing: ${viewport.name} (${viewport.width}x${viewport.height})`);
      await page.setViewport(viewport);
      await page.goto(appUrl + '/', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 500));
      await takeScreenshot(viewport.name, 'dashboard');
    }

    // Test 4: Tablet responsive test
    console.log('\n📱 Test 4: Tablet Resolution Tests');
    for (const viewport of viewports.filter(v => v.width >= 768 && v.width < 1024)) {
      console.log(`  Testing: ${viewport.name} (${viewport.width}x${viewport.height})`);
      await page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 500));
      await takeScreenshot(viewport.name, 'dashboard');
    }

    // Test 5: Mobile responsive test
    console.log('\n📲 Test 5: Mobile Resolution Tests');
    for (const viewport of viewports.filter(v => v.width < 768)) {
      console.log(`  Testing: ${viewport.name} (${viewport.width}x${viewport.height})`);
      await page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 500));
      await takeScreenshot(viewport.name, 'dashboard');
    }

    // Test 6: Form page
    console.log('\n📋 Test 6: Form Pages');
    
    // Navigate to form
    await page.setViewport({ width: 1440, height: 900 });
    const navButton = await page.$('text="New Assessment"');
    if (navButton) {
      await navButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await takeScreenshot('forms-desktop', 'new-assessment');
    }

    // Test 7: Photo section on mobile
    console.log('\n📸 Test 7: Photo Section Responsive Tests');
    const mobileViewports = [
      { name: 'Mobile-375', width: 375, height: 667 },
      { name: 'Mobile-480', width: 480, height: 800 },
      { name: 'Tablet-768', width: 768, height: 1024 },
    ];

    for (const viewport of mobileViewports) {
      console.log(`  Testing photo section: ${viewport.name}`);
      await page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 500));
      await takeScreenshot(viewport.name, 'photo-section');
    }

    // Test 8: Landscape orientation on mobile
    console.log('\n🔄 Test 8: Mobile Landscape');
    await page.setViewport({ width: 844, height: 390 });
    await takeScreenshot('06-mobile', 'landscape-orientation');

    console.log('\n✨ All tests completed!');
    console.log(`📸 ${screenshotCount - 1} screenshots captured`);
    console.log(`📁 Check the screenshots in: ${screenshotDir}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
