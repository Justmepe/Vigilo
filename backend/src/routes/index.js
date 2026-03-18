const express = require('express');
const router = express.Router();

console.log('[ROUTES] Loading route files...');

let authRoutes, jsaRoutes, lotoRoutes, injuryRoutes, accidentRoutes, spillRoutes, inspectionRoutes, facilityRoutes, equipmentRoutes, auditRoutes, adminRoutes, ehsRoutes;

try {
  authRoutes = require('./auth.routes');
  console.log('[ROUTES] auth.routes loaded');
  jsaRoutes = require('./jsa.routes');
  console.log('[ROUTES] jsa.routes loaded');
  lotoRoutes = require('./loto.routes');
  console.log('[ROUTES] loto.routes loaded');
  injuryRoutes = require('./injury.routes');
  console.log('[ROUTES] injury.routes loaded');
  accidentRoutes = require('./accident.routes');
  console.log('[ROUTES] accident.routes loaded');
  spillRoutes = require('./spill.routes');
  console.log('[ROUTES] spill.routes loaded');
  inspectionRoutes = require('./inspection.routes');
  console.log('[ROUTES] inspection.routes loaded');
  facilityRoutes = require('./facility.routes');
  console.log('[ROUTES] facility.routes loaded');
  equipmentRoutes = require('./equipment.routes');
  console.log('[ROUTES] equipment.routes loaded');
  auditRoutes = require('./audit.routes');
  console.log('[ROUTES] audit.routes loaded');
  adminRoutes = require('./admin.routes');
  console.log('[ROUTES] admin.routes loaded');
  ehsRoutes = require('./ehs.routes');
  console.log('[ROUTES] ehs.routes loaded');

} catch (err) {
  console.error('[ROUTES] ERROR loading route:', err.message);
  console.error(err.stack);
  throw err;
}

const FormsController = require('../controllers/formsController');
const { authMiddleware } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Photo upload configuration
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
});

// Routes
router.use('/auth', authRoutes);
router.use('/jsa', jsaRoutes);
router.use('/loto', lotoRoutes);
router.use('/injury', injuryRoutes);
router.use('/accident', accidentRoutes);
router.use('/spill', spillRoutes);
router.use('/inspection', inspectionRoutes);
router.use('/facilities', facilityRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/audit', auditRoutes);
router.use('/admin', adminRoutes);
router.use('/ehs', ehsRoutes);

// Photo upload endpoint - accepts both 'photos' and 'files' field names
router.post('/uploads/photos', 
  authMiddleware, 
  upload.any(), // Accept any field name
  FormsController.uploadPhotos
);

// Generic form endpoints
router.get('/forms', authMiddleware, FormsController.getFormsList);
router.post('/forms/submit', authMiddleware, FormsController.submitForm);
router.get('/forms/:formId/export-docx', authMiddleware, FormsController.exportFormDocx);
router.get('/forms/:formId/export-pdf', authMiddleware, FormsController.exportFormPdfViaLibreOffice);
router.get('/forms/:formId', authMiddleware, FormsController.getFormById);
router.put('/forms/:formId', authMiddleware, FormsController.updateForm);
router.patch('/forms/:formId', authMiddleware, FormsController.updateForm);
router.delete('/forms/:formId', authMiddleware, FormsController.deleteForm);

// Company logo endpoints
router.post('/logo/upload', authMiddleware, FormsController.uploadCompanyLogo);
router.get('/logo', authMiddleware, FormsController.getCompanyLogo);
router.delete('/logo', authMiddleware, FormsController.deleteCompanyLogo);

// Dashboard endpoints
router.get('/dashboard/stats', authMiddleware, FormsController.getDashboardStats);

module.exports = router;
