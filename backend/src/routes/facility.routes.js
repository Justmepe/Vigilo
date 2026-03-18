const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');

// Get all facilities
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Get all facilities', data: [] });
});

// Get facility by ID
router.get('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Get facility by ID', id: req.params.id });
});

// Create facility
router.post('/', authMiddleware, (req, res) => {
  res.json({ message: 'Facility created', data: req.body });
});

// Update facility
router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Facility updated', id: req.params.id });
});

// Delete facility
router.delete('/:id', authMiddleware, (req, res) => {
  res.json({ message: 'Facility deleted', id: req.params.id });
});

module.exports = router;
