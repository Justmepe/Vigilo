/**
 * Admin Routes
 * All routes require a valid JWT + Admin role (enforced in controller)
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const adminController = require('../controllers/adminController');

// All admin routes require authentication
router.use(authMiddleware);

// ── Dashboard Stats ────────────────────────────────────────────────────────────
router.get('/stats', adminController.getAdminStats);

// ── Document Management ────────────────────────────────────────────────────────
router.get('/documents', adminController.getAllDocuments);
router.get('/documents/:id', adminController.getDocumentById);
router.patch('/documents/:id/status', adminController.updateDocumentStatus);
router.post('/documents/:id/archive', adminController.archiveDocument);
router.post('/documents/:id/unarchive', adminController.unarchiveDocument);
router.post('/documents/:id/regenerate-ai', adminController.regenerateAIReport);
router.delete('/documents/:id', adminController.deleteDocument);

// ── User Management ────────────────────────────────────────────────────────────
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// ── Company Settings ───────────────────────────────────────────────────────────
router.get('/settings', adminController.getCompanySettings);
router.put('/settings', adminController.updateCompanySettings);

// ── SharePoint Sync ────────────────────────────────────────────────────────────
router.get('/sync/status', adminController.getSyncStatus);
router.post('/sync/retry-failed', adminController.retryFailedSync);
router.post('/sync/:id', adminController.syncDocument);

module.exports = router;
