const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const FormsController = require('../controllers/formsController');

// Get all LOTO assessments
router.get('/', authMiddleware, FormsController.getFormsList);

// Get LOTO by ID
router.get('/:id', authMiddleware, FormsController.getFormById);

// Create LOTO assessment
router.post('/', authMiddleware, FormsController.createLOTO);

// Update LOTO assessment
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'LOTO assessment updated', id: req.params.id });
});

// Delete LOTO assessment
router.delete('/:id', authMiddleware, FormsController.deleteForm);

// Export LOTO assessment as PDF
router.get('/:id/export-pdf', authMiddleware, FormsController.exportFormPDF);

module.exports = router;
