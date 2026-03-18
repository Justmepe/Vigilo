const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');

// Get all equipment
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Get all equipment', data: [] });
});

// Get equipment by ID
router.get('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Get equipment by ID', id: req.params.id });
});

// Create equipment
router.post('/', authMiddleware, (req, res) => {
  res.json({ message: 'Equipment created', data: req.body });
});

// Update equipment
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Equipment updated', id: req.params.id });
});

// Delete equipment
router.delete('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Equipment deleted', id: req.params.id });
});

module.exports = router;
