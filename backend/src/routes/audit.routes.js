const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const auditController = require('../controllers/auditController');
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: path.join(__dirname, '../../uploads/audit-photos'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, GIF allowed'));
  }
});

// Question bank (read-only for regular users)
router.get('/questions', authMiddleware, auditController.getQuestions);
router.get('/questions/categories', authMiddleware, auditController.getCategories);

// Admin: manage question bank
router.post('/questions', authMiddleware, auditController.createQuestion);
router.put('/questions/:id', authMiddleware, auditController.updateQuestion);
router.delete('/questions/:id', authMiddleware, auditController.deleteQuestion);

// Audit form CRUD
router.get('/', authMiddleware, auditController.listAudits);
router.post('/', authMiddleware, upload.any(), auditController.createAudit);
router.get('/:id', authMiddleware, auditController.getAudit);
router.put('/:id', authMiddleware, auditController.updateAudit);
router.delete('/:id', authMiddleware, auditController.deleteAudit);

// Document export
router.get('/:id/export-docx', authMiddleware, auditController.exportDocx);

// Findings management
router.get('/:id/findings', authMiddleware, auditController.getFindings);
router.put('/:auditId/findings/:findingId', authMiddleware, auditController.updateFinding);

module.exports = router;
