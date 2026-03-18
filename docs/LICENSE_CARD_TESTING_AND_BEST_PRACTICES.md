# License Card Generator - Testing & Best Practices Guide

## Quick Test Checklist

### Unit Tests

```javascript
// backend/src/utils/__tests__/photoValidator.test.js
const PhotoValidator = require('../photoValidator');

describe('PhotoValidator', () => {
  
  test('rejects photos smaller than 50KB', () => {
    const tinyBuffer = Buffer.alloc(10 * 1024); // 10KB
    expect(() => PhotoValidator.validatePassportPhoto(tinyBuffer))
      .toThrow('Photo too small');
  });
  
  test('rejects photos larger than 5MB', () => {
    const hugeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    expect(() => PhotoValidator.validatePassportPhoto(hugeBuffer))
      .toThrow('Photo too large');
  });
  
  test('validates valid JPEG', () => {
    // Minimum valid JPEG (100KB)
    const jpegMagic = Buffer.from([0xFF, 0xD8, 0xFF]);
    const validJpeg = Buffer.concat([jpegMagic, Buffer.alloc(100 * 1024)]);
    
    const result = PhotoValidator.validatePassportPhoto(validJpeg);
    expect(result.isValid).toBe(true);
    expect(result.format).toBe('jpeg');
  });
  
  test('validates valid PNG', () => {
    const pngMagic = Buffer.from([0x89, 0x50, 0x4E]);
    const validPng = Buffer.concat([pngMagic, Buffer.alloc(100 * 1024)]);
    
    const result = PhotoValidator.validatePassportPhoto(validPng);
    expect(result.isValid).toBe(true);
    expect(result.format).toBe('png');
  });
  
  test('extracts image buffer from data URL', () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
    const buffer = PhotoValidator.extractImageBuffer(dataUrl);
    expect(buffer).toBeInstanceOf(Buffer);
  });
  
  test('rejects invalid data URL format', () => {
    const invalidUrl = 'not-a-data-url';
    expect(() => PhotoValidator.extractImageBuffer(invalidUrl))
      .toThrow('Invalid base64 image data URL');
  });
});
```

### Integration Tests

```javascript
// backend/src/__tests__/licenseCard.integration.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

describe('License Card API Integration', () => {
  let authToken;
  let testUserId = 1;
  
  beforeAll(async () => {
    // Create test user and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'TestPass123!' });
    authToken = response.body.token;
  });
  
  afterAll(() => {
    // Cleanup generated PDFs
    const pdfsDir = path.join(__dirname, '../../pdfs');
    if (fs.existsSync(pdfsDir)) {
      fs.readdirSync(pdfsDir)
        .filter(f => f.startsWith('license-card-test'))
        .forEach(f => fs.unlinkSync(path.join(pdfsDir, f)));
    }
  });
  
  test('POST /api/license-cards creates new card', async () => {
    const testData = {
      employeeName: 'John Test Employee',
      employeeId: 'TEST-001',
      category: 'Operator',
      passportPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJ...',
      signature: null
    };
    
    const response = await request(app)
      .post('/api/license-cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.cardId).toBeDefined();
    expect(response.body.data.downloadUrl).toBeDefined();
  });
  
  test('POST rejects duplicate Employee ID', async () => {
    const testData = {
      employeeName: 'Jane Test',
      employeeId: 'DUP-001',
      category: 'Manager',
      passportPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJ...'
    };
    
    // Create first
    await request(app)
      .post('/api/license-cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testData);
    
    // Try to create duplicate
    const response = await request(app)
      .post('/api/license-cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testData);
    
    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already exists');
  });
  
  test('POST rejects invalid category', async () => {
    const testData = {
      employeeName: 'Invalid Cat',
      employeeId: 'INVALID-001',
      category: 'InvalidCategory',
      passportPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJ...'
    };
    
    const response = await request(app)
      .post('/api/license-cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testData);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid category');
  });
  
  test('GET /api/license-cards/:id downloads PDF', async () => {
    const cardId = 1; // Created in previous test
    
    const response = await request(app)
      .get(`/api/license-cards/${cardId}/download`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain('attachment');
  });
  
  test('GET /api/license-cards/:id returns card details', async () => {
    const cardId = 1;
    
    const response = await request(app)
      .get(`/api/license-cards/${cardId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.employeeId).toBeDefined();
    expect(response.body.data.status).toBe('active');
    expect(response.body.data.daysUntilExpiry).toBeGreaterThan(300);
  });
  
  test('GET returns 404 for non-existent card', async () => {
    const response = await request(app)
      .get('/api/license-cards/99999')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
```

### Frontend Component Tests

```javascript
// frontend/src/components/forms/__tests__/LicenseCardForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LicenseCardForm } from '../LicenseCardForm';
import axios from 'axios';

jest.mock('axios');

describe('LicenseCardForm', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders form with all required fields', () => {
    render(<LicenseCardForm />);
    
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passport-Size Photo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Signature/i)).toBeInTheDocument();
  });
  
  test('submit button disabled when form incomplete', () => {
    render(<LicenseCardForm />);
    const submitButton = screen.getByRole('button', { name: /Generate/i });
    
    expect(submitButton).toBeDisabled();
  });
  
  test('submit button enabled when all required fields filled', async () => {
    const user = userEvent.setup();
    render(<LicenseCardForm />);
    
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Employee ID/i), 'EMP-001');
    
    // Mock photo capture
    const photoInput = screen.getByLabelText(/Passport-Size Photo/i);
    fireEvent.change(photoInput, { target: { value: 'data:image/jpeg;base64,...' } });
    
    const submitButton = screen.getByRole('button', { name: /Generate/i });
    expect(submitButton).not.toBeDisabled();
  });
  
  test('displays error message on submission failure', async () => {
    const errorMsg = 'Photo validation failed';
    axios.post.mockRejectedValue(new Error(errorMsg));
    
    render(<LicenseCardForm />);
    
    // Fill form
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Employee ID/i), 'EMP-001');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(submitButton);
    
    // Check error displayed
    await waitFor(() => {
      expect(screen.getByText(/Photo validation failed/i)).toBeInTheDocument();
    });
  });
  
  test('shows success message and download button on success', async () => {
    const mockResponse = {
      data: {
        success: true,
        cardId: 123,
        data: {
          downloadUrl: '/api/license-cards/123/download'
        }
      }
    };
    axios.post.mockResolvedValue(mockResponse);
    
    render(<LicenseCardForm />);
    
    // Fill and submit
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Employee ID/i), 'EMP-001');
    
    const submitButton = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(submitButton);
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText(/License card created successfully/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    });
  });
  
  test('resets form after successful submission', async () => {
    const mockResponse = {
      data: {
        success: true,
        cardId: 123,
        data: { downloadUrl: '/api/license-cards/123/download' }
      }
    };
    axios.post.mockResolvedValue(mockResponse);
    
    render(<LicenseCardForm />);
    
    // Fill form
    const nameInput = screen.getByLabelText(/Full Name/i);
    await userEvent.type(nameInput, 'John Doe');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(submitButton);
    
    // Form should reset
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
    });
  });
});
```

---

## E2E Test with Real Data

```javascript
// Test with actual image files
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateTestPhoto() {
  // Create 390x510px test photo (passport size)
  return await sharp({
    create: {
      width: 390,
      height: 510,
      channels: 3,
      background: { r: 0, g: 100, b: 200 }
    }
  })
    .jpeg()
    .toBuffer();
}

async function testLicenseCardGeneration() {
  const photoBuffer = await generateTestPhoto();
  const photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
  
  const testData = {
    employeeName: 'E2E Test User',
    employeeId: `E2E-${Date.now()}`,
    category: 'Manager',
    passportPhoto: photoBase64,
    signature: null
  };
  
  const response = await axios.post('http://localhost:5000/api/license-cards', testData, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('✓ Card created:', response.data.cardId);
  
  // Download and verify PDF
  const pdfResponse = await axios.get(
    `http://localhost:5000/api/license-cards/${response.data.cardId}/download`,
    { responseType: 'arraybuffer', headers: { 'Authorization': `Bearer ${authToken}` } }
  );
  
  const pdfPath = path.join(__dirname, `test-card-${response.data.cardId}.pdf`);
  fs.writeFileSync(pdfPath, pdfResponse.data);
  console.log('✓ PDF downloaded:', pdfPath);
  console.log('✓ PDF size:', pdfResponse.data.length, 'bytes');
}

// Run test
testLicenseCardGeneration().catch(err => {
  console.error('✗ Test failed:', err.message);
  process.exit(1);
});
```

---

## Best Practices & Optimization Tips

### 1. Photo Optimization

```javascript
// Don't: Store full-size photos
const fullSizePhoto = photoBuffer; // Could be 2-3MB

// Do: Compress and normalize photos
const sharp = require('sharp');

const optimizedPhoto = await sharp(photoBuffer)
  .resize(390, 510, { fit: 'cover', position: 'center' })
  .jpeg({ quality: 85 })
  .toBuffer();

// Result: ~150-200KB instead of 2-3MB
```

### 2. Error Handling

```javascript
// Don't: Generic error messages
res.status(500).json({ error: 'Something went wrong' });

// Do: Specific, actionable errors
if (photoBuffer.length < MIN_SIZE) {
  res.status(400).json({
    success: false,
    field: 'passportPhoto',
    message: 'Photo is too small. Recommended: 390×510 pixels',
    minDimensions: { width: 350, height: 450 }
  });
}
```

### 3. Database Performance

```javascript
// Don't: Store large base64 strings in database
INSERT INTO license_cards 
  (employee_name, passport_photo_base64, ...) 
VALUES (?, $HUGE_BASE64_STRING, ...);

// Do: Store path references, keep base64 in memory during PDF generation
INSERT INTO license_cards 
  (employee_name, passport_photo_path, ...) 
VALUES (?, '/path/to/photo', ...);
```

### 4. Cleanup Strategy

```javascript
// Always clean up temporary files
const tempPath = path.join(__dirname, `temp-${Date.now()}.jpg`);
try {
  fs.writeFileSync(tempPath, imageBuffer);
  doc.image(tempPath, x, y, { width, height });
} finally {
  // Always cleanup, even on error
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
}
```

### 5. Concurrency Control

```javascript
// For batch generation, use queue to prevent memory overflow
const Bull = require('bull');
const cardQueue = new Bull('license-cards');

cardQueue.process(async (job) => {
  const { employeeData, outputPath } = job.data;
  return await LicenseCardGenerator.generateCard(employeeData, outputPath);
});

// Queue job instead of generating directly
cardQueue.add({ employeeData, outputPath }, { 
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

### 6. PDF Caching

```javascript
// Don't regenerate if nothing changed
static async getLicenseCardPDF(cardId, forceRegenerate = false) {
  const card = db.get('SELECT * FROM license_cards WHERE id = ?', [cardId]);
  
  // Use cached PDF if exists and not modified
  if (card.pdf_path && fs.existsSync(card.pdf_path) && !forceRegenerate) {
    return card.pdf_path; // Return immediately
  }
  
  // Regenerate
  return await LicenseCardGenerator.generateCard(card, card.pdf_path);
}
```

---

## Performance Benchmarks

### Expected Performance (MacBook Pro, Node.js v18)

```
Photo Validation:       10-20ms
PDF Generation:        800-1200ms   (includes photo embedding)
Database Insert:        5-10ms
File I/O (cleanup):    20-50ms

Total per Card:        850-1280ms
Throughput:            47-70 cards/minute (single process)
```

### Memory Usage

```
Peak Memory per PDF:    ~50-80MB
Queue Processing:       ~200MB (with 10 pending jobs)
```

### Optimization Record

| Optimization | Impact | Implementation |
|---|---|---|
| Photo compression (before storing) | -60% disk space | Add `sharp` processing |
| PDF caching layer | -70% CPU for regenerations | Check file exists before generating |
| Async PDF generation | Prevents blocking | Use background queue |
| Stream response | -30% memory | Use `createReadStream` for download |

---

## Manual Testing Scenarios

### Scenario 1: Happy Path
```
1. Fill form with valid data
2. Capture passport photo (good lighting, clear face)
3. Capture signature (smooth strokes)
4. Click Generate
   ✓ Shows "Creating..." spinner
   ✓ Generates PDF (1-2 seconds)
   ✓ Shows success message
   ✓ Download button appears
5. Click Download
   ✓ PDF downloads as `license-card-EMP-001.pdf`
6. Open PDF in Adobe Reader or browser
   ✓ Shows front page with photo
   ✓ Shows back page with signature
   ✓ All text readable
   ✓ Photo properly positioned
```

### Scenario 2: Photo Too Small
```
1. Upload very small photo (100×100 px)
2. Click Generate
   ✓ Shows error: "Photo too small (minimum 350×450 pixels)"
   ✓ Previous photo cleared
   ✓ Focus returns to photo upload area
```

### Scenario 3: Duplicate Employee ID
```
1. Create card for EMP-001
   ✓ Success
2. Try to create another card for EMP-001
   ✓ Shows error: "Employee ID already exists"
   ✓ Database not corrupted
```

### Scenario 4: Signature Optional
```
1. Fill form WITHOUT signature
2. Click Generate
   ✓ Success (signature is optional)
3. Download PDF
   ✓ Back page shows signature line (blank)
```

### Scenario 5: Access Control
```
1. Try to download card without authentication
   ✓ Returns 401 Unauthorized
2. Try to access other user's card
   ✓ Returns 403 Forbidden (or 404 if you want to hide existence)
```

---

## Monitoring & Logging

### Key Metrics to Track

```javascript
// Add to controller
const startTime = Date.now();

try {
  await generateCard(...);
  const duration = Date.now() - startTime;
  
  logger.info('Card generated', {
    cardId,
    employeeId,
    duration,
    photoSize: photoBuffer.length,
    timestamp: new Date().toISOString()
  });
  
} catch (error) {
  const duration = Date.now() - startTime;
  logger.error('Card generation failed', {
    cardId,
    error: error.message,
    duration,
    stack: error.stack
  });
}
```

### Alerts to Set Up

```javascript
// In monitoring/logging system
if (duration > 3000) {
  alert('License card generation slow: ' + duration + 'ms');
}

if (photoBuffer.length > 4 * 1024 * 1024) {
  alert('Large photo uploaded: ' + photoBuffer.length + ' bytes');
}
```

---

## Database Query Performance

### Create Indexes for Fast Lookups

```sql
-- Already recommended in main guide, but critical:
CREATE INDEX idx_license_cards_employee_id 
  ON license_cards(employee_id);

CREATE INDEX idx_license_cards_expiration 
  ON license_cards(expiration_date);

-- For admin dashboards
CREATE INDEX idx_license_cards_status 
  ON license_cards(status);

-- Find expiring cards (monthly task)
SELECT * FROM license_cards 
WHERE expiration_date BETWEEN DATE('now') AND DATE('now', '+30 days')
AND status = 'active';

-- This query should complete in <10ms with index
```

---

**Testing Documentation Version: 1.0**  
**Last Updated: February 13, 2026**  
**Ready for QA & Deployment**
