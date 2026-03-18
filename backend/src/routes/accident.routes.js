const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const FormsController = require('../controllers/formsController');

// Get all accident reports
router.get('/', authMiddleware, FormsController.getFormsList);

// Get accident report by ID
router.get('/:id', authMiddleware, FormsController.getFormById);

// Create accident report
router.post('/', authMiddleware, FormsController.createAccidentReport);

// Update accident report
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Accident report updated', id: req.params.id });
});

// Delete accident report
router.delete('/:id', authMiddleware, FormsController.deleteForm);

// Export accident report as PDF
router.get('/:id/export-pdf', authMiddleware, FormsController.exportFormPDF);

module.exports = router;
