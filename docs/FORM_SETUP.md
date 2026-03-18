# Form Workflow Setup Guide

## Overview

The Safety Forms System provides a complete workflow for creating, submitting, and managing safety documentation for a seafood processing facility.

## Form System Architecture

### Frontend Forms (React Components)

Located in `frontend/src/components/forms/`:

1. **JSAForm.jsx** - Job Safety Analysis (4-step workflow)
   - Step 1: Basic information (job, location, department)
   - Step 2: Hazard identification & control measures
   - Step 3: Job step-by-step procedures
   - Step 4: Review/approval + photo capture

2. **LOTOForm.jsx** - Lockout/Tagout (Energy control)
   - Equipment information
   - Energy source identification
   - Isolation methods
   - Hazard verification
   - Photo documentation

3. **InjuryReportForm.jsx** - Incident Reporting
   - Incident details & location
   - Employee information
   - Injury classification
   - Root cause analysis
   - Photo evidence

4. **AccidentReportForm.jsx** - Vehicle/Equipment Accidents
   - Accident location & conditions
   - Vehicle information
   - Driver details
   - Damage assessment
   - Witness statements
   - Photo documentation

5. **SpillReleaseForm.jsx** - Environmental Releases
   - Incident information
   - Material identification
   - Environmental impact assessment
   - Response & containment
   - Regulatory notification
   - Cleanup documentation
   - Root cause analysis

6. **InspectionForm.jsx** - Monthly Facility Inspection
   - Area inspection checklist
   - Emergency equipment status
   - Housekeeping assessment
   - Equipment & machinery inspection
   - PPE availability
   - Chemical storage review
   - Environmental conditions

### Supporting Components

**PhotoCapture.jsx** - Universal photo capture:
- Camera access via getUserMedia API
- Fallback file upload
- Photo preview grid
- Caption field for each photo
- Size validation (10MB limit)
- Multiple photo support

**FormComponents.jsx** - Reusable UI building blocks:
- `FormSection` - Section containers
- `FormField` - Universal input handler (text, select, textarea, checkbox, radio)
- `CheckboxArray` - Multi-selection component
- `FormButtonGroup` - Submit/Cancel buttons
- `FormDivider` - Section separators
- `FormAlert` - Status messages
- `FormIndicator` - Progress tracker

**FormDashboard.jsx** - Main form selection menu:
- Welcome screen
- Form selector with descriptions
- Form history/recent submissions
- User information display
- Logout functionality

### Backend API

Location: `backend/src/`

**Controllers:**
- `formsController.js` - Handles all form operations

**Routes:**
- `jsa.routes.js` - JSA endpoints
- `loto.routes.js` - LOTO endpoints
- `injury.routes.js` - Injury report endpoints
- `accident.routes.js` - Accident report endpoints
- `spill.routes.js` - Spill report endpoints
- `inspection.routes.js` - Inspection endpoints
- `index.js` - Photo upload at `/uploads/photos`

**Key Endpoints:**
```
POST   /api/jsa              - Create JSA
GET    /api/jsa              - List JSA forms
GET    /api/jsa/:id          - Get JSA by ID
POST   /api/injury           - Create injury report
POST   /api/loto             - Create LOTO form
POST   /api/accident         - Create accident report
POST   /api/spill            - Create spill report
POST   /api/inspection       - Create inspection form
POST   /api/uploads/photos   - Upload photos (multipart)
GET    /api/forms/:formId    - Get any form
DELETE /api/forms/:formId    - Delete form
GET    /api/forms            - List forms with filters
```

## Form Submission Workflow

### Step 1: User Authentication
```
1. User navigates to /login
2. Enter credentials (default: admin / Admin123!)
3. JWT token obtained via AuthContext
4. Redirected to /dashboard
```

### Step 2: Form Selection
```
1. FormDashboard displays 6 form options
2. User clicks desired form
3. Form component loads (JSAForm, LOTOForm, etc.)
4. Form state initialized with defaults
```

### Step 3: Form Completion
```
1. User fills multi-step form
2. Validation on each step
3. User captures photos (optional for most forms, required for some)
4. User review/approval step
5. Submit button enabled when validation passes
```

### Step 4: Form Submission
```
1. Form data serialized:
   - Arrays converted to comma-separated strings
   - Complex objects converted to JSON
2. POST /api/[formType]
3. Backend generates formId (e.g., JSA-1234567890)
4. Response includes formId
5. Photos uploaded separately:
   - POST /api/uploads/photos
   - Multipart form-data with formId
```

### Step 5: Confirmation & Next Steps
```
1. Success message displayed with reference number
2. Form history updated
3. Option to return to form menu
4. PDF export available via /api/forms/{formId}/export-pdf
```

## API Integration Details

### Form Service (frontend/src/services/forms.js)

All API calls handled by centralized service layer:

```javascript
// Create form and upload photos
await submitJSA(formData, capturedPhotos);

// Response structure:
{
  success: true,
  id: "JSA-1234567890",
  message: "JSA form created successfully",
  data: { formId, createdAt, ...formData }
}

// Upload photos separately
await uploadPhotos(formId, capturedPhotos, 'jsa');

// Export PDF
await exportFormPDF(formId);
```

### Authentication

All requests require Authorization header:
```
Authorization: Bearer {jwt_token}
```

Token obtained from `/api/auth/login` endpoint and stored in AuthContext.

### Photo Upload

Multipart form-data with structure:
```
POST /api/uploads/photos
Content-Type: multipart/form-data

formId: "JSA-1234567890"
type: "jsa"
photos: [File, File, ...]
captions[0]: "First photo caption"
captions[1]: "Second photo caption"
```

## Database Storage (Future Implementation)

Recommended schema:
```sql
-- Forms table
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  type VARCHAR(50),
  user_id INTEGER,
  form_data JSON,
  created_at DATETIME,
  updated_at DATETIME,
  status VARCHAR(20) -- draft, submitted, reviewed, approved
);

-- Photos table
CREATE TABLE form_photos (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  form_id TEXT,
  filename VARCHAR(255),
  filepath VARCHAR(255),
  caption TEXT,
  uploaded_at DATETIME,
  FOREIGN KEY (form_id) REFERENCES forms(id)
);
```

## Running the System

### Prerequisites
- Node.js 16+
- React 18+
- SQLite3 (or database of choice)

### Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

### Test Form Submission
1. Navigate to http://localhost:3000
2. Login with admin/Admin123!
3. Select JSA Form
4. Fill in required fields
5. Click "Submit JSA Form"
6. Check browser console for API responses

## Customization

### Adding a New Form

1. Create form component: `frontend/src/components/forms/NewForm.jsx`
2. Create form service method: `submitNewForm()` in forms.js
3. Add controller method: `FormsController.createNewForm()`
4. Create routes: `backend/src/routes/newform.routes.js`
5. Register route in `backend/src/routes/index.js`
6. Add form to FormDashboard menu

### Styling

All forms use Tailwind CSS:
- Primary color: Blue (#2563EB)
- Success: Green (#16A34A)
- Warning: Yellow (#CA8A04)
- Error: Red (#DC2626)
- Neutral: Gray (#6B7280)

### Validation

Client-side validation in each form:
```javascript
const validateForm = useCallback(() => {
  const newErrors = {};
  if (!formData.fieldName) newErrors.fieldName = 'Required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [formData]);
```

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: ProtectedRoute wrapper
3. **Input Validation**: Server-side validation required
4. **File Upload**: Mimetype & size restrictions
5. **CORS**: Configure allowed origins in production
6. **Rate Limiting**: Recommended for production

## PDF Export (Future)

To enable PDF generation:
```bash
npm install pdfkit
npm install sharp # for image processing
```

Then implement PDF generation in formsController:
```javascript
const PDFDocument = require('pdfkit');
const embed images with form data
create report with branding
```

## Troubleshooting

### Photos not uploading
- Check browser console for 413 Payload Too Large
- Verify file size < 10MB
- Check /uploads directory exists and is writable

### Form not submitting
- Verify all required fields filled
- Check console for validation errors
- Ensure JWT token is valid (no expiration)

### Camera not working
- Check browser permissions
- HTTPS required for production (camera API security)
- Test with fallback file upload

### API not responding
- Verify backend running on port 5000
- Check CORS configuration
- Verify authMiddleware passing token

## Support & Feedback

For issues or feature requests, contact the Safety Management team.
