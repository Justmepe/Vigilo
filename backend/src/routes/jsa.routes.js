const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const FormsController = require('../controllers/formsController');

console.log('[JSA-ROUTES] FormsController methods:', Object.getOwnPropertyNames(FormsController));
console.log('[JSA-ROUTES] getFormsList type:', typeof FormsController.getFormsList);

// Get all JSA forms
router.get('/', authMiddleware, FormsController.getFormsList);
console.log('[JSA-ROUTES] Route GET / registered');

// Get JSA by ID
router.get('/:id', authMiddleware, FormsController.getFormById);

// Create JSA form
router.post('/', authMiddleware, FormsController.createJSA);

// Update JSA form
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'JSA form updated', id: req.params.id });
});

// Delete JSA form
router.delete('/:id', authMiddleware, FormsController.deleteForm);

// Export JSA form as PDF
router.get('/:id/export-pdf', authMiddleware, FormsController.exportFormPDF);

module.exports = router;
