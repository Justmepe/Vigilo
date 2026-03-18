const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const FormsController = require('../controllers/formsController');

// Get all inspection reports
router.get('/', authMiddleware, FormsController.getFormsList);

// Get inspection report by ID
router.get('/:id', authMiddleware, FormsController.getFormById);

// Create inspection report
router.post('/', authMiddleware, FormsController.createInspection);

// Update inspection report
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Inspection report updated', id: req.params.id });
});

// Delete inspection report
router.delete('/:id', authMiddleware, FormsController.deleteForm);

// Export inspection report as PDF
router.get('/:id/export-pdf', authMiddleware, FormsController.exportFormPDF);

module.exports = router;
