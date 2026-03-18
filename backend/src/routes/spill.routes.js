const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const FormsController = require('../controllers/formsController');

// Get all spill reports
router.get('/', authMiddleware, FormsController.getFormsList);

// Get spill report by ID
router.get('/:id', authMiddleware, FormsController.getFormById);

// Create spill report
router.post('/', authMiddleware, FormsController.createSpillReport);

// Update spill report
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Spill report updated', id: req.params.id });
});

// Delete spill report
router.delete('/:id', authMiddleware, FormsController.deleteForm);

// Export spill report as PDF
router.get('/:id/export-pdf', authMiddleware, FormsController.exportFormPDF);

module.exports = router;
