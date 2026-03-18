const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const FormsController = require('../controllers/formsController');

// Get all injury reports
router.get('/', authMiddleware, FormsController.getFormsList);

// Get injury report by ID
router.get('/:id', authMiddleware, FormsController.getFormById);

// Create injury report
router.post('/', authMiddleware, FormsController.createInjuryReport);

// Update injury report
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Injury report updated', id: req.params.id });
});

// Delete injury report
router.delete('/:id', authMiddleware, FormsController.deleteForm);

// Export injury report as PDF
router.get('/:id/export-pdf', authMiddleware, FormsController.exportFormPDF);

module.exports = router;
