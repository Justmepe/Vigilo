# License Card Generator - Architecture & File Structure Reference

## 📁 Project File Organization

```
d:\Safety\
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js               (existing)
│   │   │   ├── pdfConfig.js              (existing) 
│   │   │   └── constants.js              (existing)
│   │   │
│   │   ├── controllers/
│   │   │   ├── formsController.js        (existing - reference for PDF patterns)
│   │   │   └── licenseCardController.js  ✨ NEW
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js                 (existing)
│   │   │   ├── errors.js                 (existing)
│   │   │   ├── photoValidator.js         ✨ NEW
│   │   │   └── licenseCardGenerator.js   ✨ NEW
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        (existing)
│   │   │   └── ... other middleware
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js                  (UPDATE: add route)
│   │   │   ├── jsa.routes.js             (existing - reference)
│   │   │   ├── loto.routes.js            (existing - reference)
│   │   │   └── licenseCards.routes.js    ✨ NEW
│   │   │
│   │   └── app.js                        (existing)
│   │
│   ├── database/
│   │   ├── schema.sql                    (UPDATE: add license_cards tables)
│   │   └── ... migrations
│   │
│   ├── package.json                      (UPDATE: dependencies)
│   ├── pdfs/          # PDF output directory (auto-created)
│   └── server.js                         (existing)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── forms/
│   │   │   │   └── LicenseCardForm.jsx   ✨ NEW
│   │   │   │
│   │   │   ├── PhotoCapture.jsx          (existing - reuse)
│   │   │   │
│   │   │   └── SignatureCapture.jsx      ✨ NEW (optional)
│   │   │
│   │   ├── services/
│   │   │   └── api.js                    (existing - add endpoint)
│   │   │
│   │   └── App.jsx                       (UPDATE: add route)
│   │
│   └── package.json                      (UPDATE: ensure dependencies)
│
├── database/
│   ├── schema.sql                        (UPDATE: add tables)
│   └── ... migrations
│
└── 📄 Documentation Files (NEW)
    ├── LICENSE_CARD_GENERATOR_FEASIBILITY_STUDY.md
    ├── LICENSE_CARD_IMPLEMENTATION_QUICKSTART.md
    ├── LICENSE_CARD_TESTING_AND_BEST_PRACTICES.md
    ├── LICENSE_CARD_PROJECT_SUMMARY.md
    └── LICENSE_CARD_ARCHITECTURE_REFERENCE.md (this file)
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND                          │
│                                                                 │
│  ┌────────────────────────┐       ┌──────────────────────┐    │
│  │  LicenseCardForm.jsx   │       │  PhotoCapture.jsx    │    │
│  │                        │       │  SignatureCapture.jsx│    │
│  │  • Form inputs         │════>  │                      │    │
│  │  • Validation          │       │  • Canvas capture    │    │
│  │  • Submit handler      │       │  • Base64 encoding   │    │
│  │                        │       │                      │    │
│  └────────────────────────┘       └──────────────────────┘    │
│                │                                                │
│                │ axios.post('/api/license-cards')             │
│                │ {                                              │
│                │   employeeName, employeeId,                   │
│                │   category, passportPhoto,                    │
│                │   signature                                   │
│                │ }                                              │
│                ▼                                                │
└─────────────────────────────────────────────────────────────────┘
                        🌐 HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  routes/licenseCards.routes.js                      │       │
│  │  POST /api/license-cards                            │       │
│  │  GET  /api/license-cards/:cardId/download           │       │
│  │  GET  /api/license-cards/:cardId                    │       │
│  └──┬──────────────────────────────────────────────────┘       │
│     │                                                            │
│     ▼                                                            │
│  ┌────────────────────────────────────────────────┐            │
│  │  licenseCardController.js                      │            │
│  │                                                 │            │
│  │  createLicenseCard(req, res)                  │            │
│  │  ├─ Extract form data                         │            │
│  │  ├─ Validate input                            │            │
│  │  └─ Generate card                             │            │
│  │                                                 │            │
│  └──┬─────────────────────────────────────────────┘            │
│     │                                                            │
│     ├──────────────────┬──────────────────┬────────────┐       │
│     ▼                  ▼                  ▼            ▼       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │
│  │PhotoVal. │  │CardGenerator │  │  Database    │  │Logging │ │
│  │          │  │              │  │              │  │        │ │
│  │Validate: │  │Generate PDF: │  │Store card    │  │Log all │ │
│  │• Size    │  │• Front page  │  │metadata      │  │ops     │ │
│  │• Format  │  │• Back page   │  │• Audit trail │  │        │ │
│  │• Content │  │• 2-sided     │  │              │  │        │ │
│  └──────────┘  │• Photos      │  └──────────────┘  └────────┘ │
│                │• Signatures  │                                │
│                │• Layout      │                                │
│                └──────────────┘                                │
│                       │                                         │
│                       ▼                                         │
│                 ┌────────────┐                                 │
│                 │ PDFKit     │                                 │
│                 │            │                                 │
│                 │ Write PDF  │                                 │
│                 │ to disk    │                                 │
│                 └────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
              📄 PDF File System
┌─────────────────────────────────────────────────────────────────┐
│  /backend/pdfs/                                                │
│  ├── license-card-EMP-001-123-2026-02-13.pdf  ✓               │
│  ├── license-card-EMP-002-124-2026-02-13.pdf  ✓               │
│  └── ... more cards                                            │
│                                                                 │
│  SQLite Database                                               │
│  ├── license_cards table                                       │
│  │   id, employee_name, passport_photo_base64,                │
│  │   pdf_path, status, created_at, ...                        │
│  │                                                              │
│  └── license_card_audit table                                  │
│      id, card_id, action, performed_by, ...                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Key Classes & Functions

### Backend Classes

#### `PhotoValidator`
```javascript
class PhotoValidator {
  validatePassportPhoto(buffer)     // Check size, format, dimensions
  validateSignature(buffer)         // Less strict validation
  extractImageBuffer(dataUrl)       // Decode base64 to Buffer
}
```

#### `LicenseCardGenerator`
```javascript
class LicenseCardGenerator {
  generateCard(licenseData, outputPath)  // Main PDF generation
  _renderFrontPage(...)                  // Front side layout
  _renderBackPage(...)                   // Back side layout
  _extractImageBuffer(dataUrl)           // Helper
}
```

#### `LicenseCardController`
```javascript
class LicenseCardController {
  createLicenseCard(req, res, next)     // POST handler
  downloadLicenseCard(req, res, next)   // GET PDF download
  viewLicenseCard(req, res, next)       // GET card details
  _calculateDaysUntilExpiry(date)       // Helper
}
```

### Frontend Components

#### `LicenseCardForm`
```jsx
export function LicenseCardForm() {
  // State: formData, loading, error, success
  // Handlers: submit, inputChange, photoCapture, signatureCapture
  // Render: form with photo/signature capture, submit button
}
```

#### `SignatureCapture` (Optional)
```jsx
export function SignatureCapture({ onSignatureSave }) {
  // Canvas element for drawing signature
  // Save/Clear/Download buttons
  // Converts to base64 data URL
}
```

---

## 🔗 Component Interactions

### Form Submission Flow

```
LicenseCardForm.jsx
    │
    ├─ handlePhotoCapture() → photoBuffer → convertToBase64()
    ├─ handleSignatureCapture() → signatureBuffer → convertToBase64()
    │
    └─ handleSubmit()
        │
        ├─ Validate form locally
        │
        ├─ axios.post('/api/license-cards', {
        │   employeeName, employeeId, category,
        │   passportPhoto: base64, signature: base64
        │ })
        │
        └─ licenseCardController.createLicenseCard()
            │
            ├─ PhotoValidator.validatePassportPhoto() ✓
            ├─ PhotoValidator.validateSignature() ✓
            │
            ├─ db.run() INSERT license_cards → ✓ Returns cardId
            │
            ├─ LicenseCardGenerator.generateCard()
            │   ├─ Create PDFDocument (500x315pt)
            │   ├─ Render front page:
            │   │   ├─ Background color
            │   │   ├─ Company header
            │   │   ├─ Embed photo at (100, 80)
            │   │   ├─ Employee info text
            │   │   └─ QR code placeholder
            │   │
            │   ├─ doc.addPage() → Create back page
            │   ├─ Render back page:
            │   │   ├─ Background
            │   │   ├─ Embed signature
            │   │   ├─ Terms & conditions
            │   │   └─ Footer
            │   │
            │   └─ doc.end() → Write to disk
            │
            ├─ db.run() UPDATE license_cards SET pdf_path → ✓
            ├─ db.run() INSERT license_card_audit → ✓
            │
            └─ res.json({
                success: true,
                cardId: 123,
                downloadUrl: '/api/license-cards/123/download'
              })
```

### Download Flow

```
Browser: GET /api/license-cards/123/download
    │
    └─ licenseCardController.downloadLicenseCard()
        │
        ├─ db.get() SELECT pdf_path FROM license_cards WHERE id=123
        │
        ├─ fs.createReadStream(pdfPath)
        │
        ├─ res.setHeader('Content-Type: application/pdf')
        ├─ res.setHeader('Content-Disposition: attachment; ...')
        │
        └─ fileStream.pipe(res) → Download to browser
```

---

## 🗄️ Database Schema

### `license_cards` Table

```sql
CREATE TABLE license_cards (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id              INTEGER,
  employee_name        TEXT NOT NULL,
  employee_id          TEXT NOT NULL UNIQUE,
  category             TEXT NOT NULL,
  issue_date           DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiration_date      DATETIME NOT NULL,
  passport_photo_base64 LONGTEXT,
  signature_base64      LONGTEXT,
  pdf_path             TEXT,
  qr_code_data         TEXT,
  status               TEXT DEFAULT 'active',
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
)
```

**Example Row:**
```
id:                   123
user_id:              5
employee_name:        'John Michael Sales'
employee_id:          'EMP-001234'
category:             'Manager'
issue_date:           '2026-02-13 10:30:00'
expiration_date:      '2027-02-13 10:30:00'
passport_photo_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
signature_base64:     'data:image/png;base64,iVBORw0KGgoAAAA...'
pdf_path:             '/backend/pdfs/license-card-EMP-001234-123-2026-02-13.pdf'
qr_code_data:         'EMP-001234:8RK7R0'
status:               'active'
created_at:           '2026-02-13 10:30:00'
updated_at:           '2026-02-13 10:30:00'
```

### `license_card_audit` Table

```sql
CREATE TABLE license_card_audit (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id      INTEGER NOT NULL,
  action       TEXT NOT NULL,
  performed_by INTEGER,
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (card_id) REFERENCES license_cards(id)
)
```

**Example Audit Trail:**
```
card_id=123, action='created', performed_by=5, created_at='2026-02-13 10:30:00'
card_id=123, action='regenerated', performed_by=5, created_at='2026-02-14 08:15:00'
card_id=123, action='revoked', performed_by=2, notes='Terminated', created_at='2026-06-01 14:20:00'
```

---

## 🔐 Security Considerations

### Input Validation & Sanitization

```
Frontend                           Backend
  │                                  │
  ├─ Check photo size            ├─ Re-validate photo
  ├─ Check photo format          ├─ PhotoValidator.validatePassportPhoto()
  ├─ Check field lengths         ├─ Check employee_id not duplicate
  ├─ Client-side validation      ├─ Check category in enum
  │                                  ├─ Verify user is authorized
  └─ Fire & forget async request ├─ Sanitize all inputs before DB
                                   ├─ Use parameterized queries
                                   └─ Log all operations
```

### File Security

```
Photo Upload         PDF Generation           File Download
    │                    │                         │
    ├─ Temp buffer       ├─ Temp file created ├─ Stream to response
    ├─ Validate MIME     ├─ Used in PDF      ├─ Set correct headers
    ├─ Decode base64     ├─ Deleted ASAP     ├─ Verify user owns card
    ├─ Store base64      ├─ Errors handled   └─ Log download
    └─ Never disk        └─ Try/finally block
      initially            for cleanup
```

---

## 🧪 Testing Coverage Map

```
photoValidator.js (50 lines)
├─ Unit Tests
│  ├─ Size validation: valid, too small, too large
│  ├─ Format validation: JPEG, PNG, invalid
│  └─ Base64 extraction: valid, invalid URLs
│
│ Coverage: 95% ✓

licenseCardGenerator.js (200 lines)
├─ Unit Tests
│  ├─ Front page rendering
│  ├─ Back page rendering
│  ├─ Image embedding
│  ├─ Text positioning
│  └─ PDF creation
│
├─ Integration Tests
│  ├─ Full card generation
│  ├─ Photo scaling
│  ├─ Signature embedding
│  └─ File system cleanup
│
│ Coverage: 90% ✓

licenseCardController.js (150 lines)
├─ Integration Tests
│  ├─ POST /api/license-cards
│  │  ├─ Valid data → 201 Created
│  │  ├─ Missing fields → 400 BadRequest
│  │  ├─ Duplicate ID → 409 Conflict
│  │  ├─ Invalid category → 400 BadRequest
│  │  └─ Photo validation error → 400 BadRequest
│  │
│  ├─ GET /api/license-cards/:id
│  │  ├─ Valid ID → 200 OK with details
│  │  └─ Invalid ID → 404 Not Found
│  │
│  └─ GET /api/license-cards/:id/download
│     ├─ Valid ID → 200 OK with PDF
│     ├─ Invalid ID → 404 Not Found
│     ├─ Missing auth → 401 Unauthorized
│     └─ Wrong user → 403 Forbidden
│
│ Coverage: 90% ✓

LicenseCardForm.jsx (200 lines)
├─ Component Tests
│  ├─ Render: all form fields present
│  ├─ Validation: submit disabled when incomplete
│  ├─ Photo capture: triggers update
│  ├─ Form submission: calls POST endpoint
│  ├─ Error handling: displays error message
│  ├─ Success handling: shows success & download button
│  └─ Form reset: clears after success
│
│ Coverage: 85% ✓

E2E Tests
├─ Happy path: Create → Download → Verify PDF
├─ Error cases: Invalid photo, duplicate ID, etc.
├─ Edge cases: Large photos, special characters, etc.
└─ Performance: Generation time, memory usage
```

---

## 📊 Performance Metrics

### Expected Benchmarks

| Operation | Time | Memory |
|-----------|------|--------|
| Photo validation | 10-20ms | <5MB |
| PDF generation | 800-1200ms | 50-80MB |
| Database insert | 5-10ms | <1MB |
| File I/O cleanup | 20-50ms | <1MB |
| **Total per card** | **850-1280ms** | **~100MB peak** |

### Typical Load

```
Single user: 1 card/minute
10 users: 10 card/minute = 1.26s response time
100 users: 100 cards/minute = needs job queue
```

### Optimization Points

```
1. Large photos
   Current: ~2-3MB each
   Optimized: ~200-300KB (with sharp compression)
   Savings: 85% less disk, faster transfers

2. Repeat regeneration
   Current: Full PDF generation each time (~1.2s)
   Optimized: Cache PDF, regenerate only if changed
   Savings: 70% faster for cached requests

3. Async generation
   Current: Blocks request until PDF complete
   Optimized: Queue job, return immediately
   Savings: Better user experience, no timeout risk
```

---

## 📞 Support & Maintenance

### Common Operations

**List all active cards:**
```sql
SELECT employee_name, employee_id, expiration_date 
FROM license_cards 
WHERE status = 'active' 
ORDER BY expiration_date ASC;
```

**Find expiring cards (30 days):**
```sql
SELECT * FROM license_cards 
WHERE expiration_date BETWEEN DATE('now') AND DATE('now', '+30 days')
AND status = 'active';
```

**Revoke a card:**
```sql
UPDATE license_cards 
SET status = 'revoked' 
WHERE id = 123;

INSERT INTO license_card_audit (card_id, action, performed_by, notes)
VALUES (123, 'revoked', 5, 'Employee terminated');
```

**Export all cards for backup:**
```javascript
// Use existing JSON export patterns from your forms
// Or generate bulk PDF download
```

---

## 🚀 Deployment Checklist

- [ ] Database schema migrated
- [ ] Environment variables set
- [ ] PDF output directory created with proper permissions
- [ ] Backend server restarted
- [ ] Routes tested with Postman
- [ ] Frontend component deployed
- [ ] Form tested end-to-end
- [ ] PDF quality verified
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] User training completed
- [ ] Monitoring/logging verified
- [ ] Backup procedures tested

---

**Architecture Reference Version: 1.0**  
**Last Updated: February 13, 2026**  
**For Implementation Team**

---

## Related Documentation

1. **LICENSE_CARD_GENERATOR_FEASIBILITY_STUDY.md** - Full technical analysis
2. **LICENSE_CARD_IMPLEMENTATION_QUICKSTART.md** - Ready-to-use code
3. **LICENSE_CARD_TESTING_AND_BEST_PRACTICES.md** - Testing strategies
4. **LICENSE_CARD_PROJECT_SUMMARY.md** - Executive summary

All documents are cross-referenced and complementary.
