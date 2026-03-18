/**
 * EHS Routes — incidents, actions, inspection-schedule, permits, PPE,
 *              attendance, training, risk, toolbox, dashboard
 */
const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');

const incidentsCtrl  = require('../controllers/incidentsController');
const actionsCtrl    = require('../controllers/actionsController');
const inspSchedCtrl  = require('../controllers/inspectionsScheduleController');
const permitsCtrl    = require('../controllers/permitsController');
const ppeCtrl        = require('../controllers/ppeController');
const attendanceCtrl = require('../controllers/attendanceController');
const trainingCtrl   = require('../controllers/trainingController');
const riskCtrl       = require('../controllers/riskController');
const toolboxCtrl    = require('../controllers/toolboxController');
const dashCtrl       = require('../controllers/ehsDashboardController');

// ─── Incidents ────────────────────────────────────────────────────────────────
router.get   ('/incidents',     authMiddleware, incidentsCtrl.list);
router.post  ('/incidents',     authMiddleware, incidentsCtrl.create);
router.get   ('/incidents/:id', authMiddleware, incidentsCtrl.getById);
router.put   ('/incidents/:id', authMiddleware, incidentsCtrl.update);
router.delete('/incidents/:id', authMiddleware, incidentsCtrl.remove);

// ─── Actions ─────────────────────────────────────────────────────────────────
router.get   ('/actions',     authMiddleware, actionsCtrl.list);
router.post  ('/actions',     authMiddleware, actionsCtrl.create);
router.get   ('/actions/:id', authMiddleware, actionsCtrl.getById);
router.put   ('/actions/:id', authMiddleware, actionsCtrl.update);
router.delete('/actions/:id', authMiddleware, actionsCtrl.remove);

// ─── Inspection Schedule ──────────────────────────────────────────────────────
router.get   ('/inspection-schedule',     authMiddleware, inspSchedCtrl.list);
router.post  ('/inspection-schedule',     authMiddleware, inspSchedCtrl.create);
router.get   ('/inspection-schedule/:id', authMiddleware, inspSchedCtrl.getById);
router.put   ('/inspection-schedule/:id', authMiddleware, inspSchedCtrl.update);
router.delete('/inspection-schedule/:id', authMiddleware, inspSchedCtrl.remove);

// ─── Permits ──────────────────────────────────────────────────────────────────
router.get   ('/permits',     authMiddleware, permitsCtrl.list);
router.post  ('/permits',     authMiddleware, permitsCtrl.create);
router.get   ('/permits/:id', authMiddleware, permitsCtrl.getById);
router.put   ('/permits/:id', authMiddleware, permitsCtrl.update);
router.delete('/permits/:id', authMiddleware, permitsCtrl.remove);

// ─── PPE Inventory ────────────────────────────────────────────────────────────
router.get   ('/ppe',     authMiddleware, ppeCtrl.list);
router.post  ('/ppe',     authMiddleware, ppeCtrl.create);
router.get   ('/ppe/:id', authMiddleware, ppeCtrl.getById);
router.put   ('/ppe/:id', authMiddleware, ppeCtrl.update);
router.delete('/ppe/:id', authMiddleware, ppeCtrl.remove);

// ─── Site Attendance ──────────────────────────────────────────────────────────
router.get   ('/attendance',       authMiddleware, attendanceCtrl.list);
router.get   ('/attendance/today', authMiddleware, attendanceCtrl.today);
router.post  ('/attendance',       authMiddleware, attendanceCtrl.create);
router.put   ('/attendance/:id',   authMiddleware, attendanceCtrl.update);
router.delete('/attendance/:id',   authMiddleware, attendanceCtrl.remove);

// ─── Training ─────────────────────────────────────────────────────────────────
router.get   ('/training',        authMiddleware, trainingCtrl.list);
router.get   ('/training/matrix', authMiddleware, trainingCtrl.matrix);
router.post  ('/training',        authMiddleware, trainingCtrl.create);
router.put   ('/training/:id',    authMiddleware, trainingCtrl.update);
router.delete('/training/:id',    authMiddleware, trainingCtrl.remove);

// ─── Risk Register ────────────────────────────────────────────────────────────
router.get   ('/risks',     authMiddleware, riskCtrl.list);
router.post  ('/risks',     authMiddleware, riskCtrl.create);
router.get   ('/risks/:id', authMiddleware, riskCtrl.getById);
router.put   ('/risks/:id', authMiddleware, riskCtrl.update);
router.delete('/risks/:id', authMiddleware, riskCtrl.remove);

// ─── Toolbox Talks ────────────────────────────────────────────────────────────
router.get   ('/toolbox',     authMiddleware, toolboxCtrl.list);
router.post  ('/toolbox',     authMiddleware, toolboxCtrl.create);
router.get   ('/toolbox/:id', authMiddleware, toolboxCtrl.getById);
router.put   ('/toolbox/:id', authMiddleware, toolboxCtrl.update);
router.delete('/toolbox/:id', authMiddleware, toolboxCtrl.remove);

// ─── EHS Dashboard ────────────────────────────────────────────────────────────
router.get('/ehs-dashboard/stats', authMiddleware, dashCtrl.stats);

module.exports = router;
