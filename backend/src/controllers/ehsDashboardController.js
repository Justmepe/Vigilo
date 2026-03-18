/**
 * EHS Dashboard Controller — aggregated live safety stats
 */
const db = require('../config/database');
const logger = require('../utils/logger');

async function stats(req, res) {
  try {
    const companyId = req.user.company_id;
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    // Days without incident
    const lastIncident = await db.getAsync(
      `SELECT incident_date FROM incidents WHERE company_id = ? ORDER BY incident_date DESC LIMIT 1`,
      [companyId]
    );
    let daysWithoutIncident = null;
    if (lastIncident) {
      const diff = new Date(today) - new Date(lastIncident.incident_date);
      daysWithoutIncident = Math.floor(diff / 86400000);
    }

    // Open / overdue actions
    const actionStats = await db.getAsync(
      `SELECT
         COUNT(*) FILTER (WHERE status != 'Closed') AS open_actions,
         COUNT(*) FILTER (WHERE status != 'Closed' AND due_date < ?) AS overdue_actions
       FROM actions WHERE company_id = ?`,
      [today, companyId]
    );

    // Workers on site today
    const siteStats = await db.getAsync(
      `SELECT COUNT(*) FILTER (WHERE status = 'On Site') AS on_site
       FROM site_attendance WHERE company_id = ? AND attendance_date = ?`,
      [companyId, today]
    );

    // Training compliance (valid / total excluding not_held)
    const trainStats = await db.getAsync(
      `SELECT
         COUNT(*) FILTER (WHERE cert_status = 'valid') AS valid,
         COUNT(*) FILTER (WHERE cert_status != 'not_held') AS total
       FROM training_records WHERE company_id = ?`,
      [companyId]
    );
    const trainingCompliance = trainStats.total > 0
      ? Math.round((trainStats.valid / trainStats.total) * 100)
      : null;

    // Active permits
    const permitStats = await db.getAsync(
      `SELECT COUNT(*) FILTER (WHERE status = 'Active') AS active_permits FROM permits WHERE company_id = ?`,
      [companyId]
    );

    // Incidents this month
    const incidentMtd = await db.getAsync(
      `SELECT COUNT(*) AS mtd FROM incidents WHERE company_id = ? AND incident_date >= ?`,
      [companyId, monthStart]
    );

    // Recent alerts (overdue actions + expiring permits + overdue inspections)
    const overdueActions = await db.allAsync(
      `SELECT 'action' AS alert_type, action_ref AS ref, title AS text, 'warning' AS level
       FROM actions WHERE company_id = ? AND status != 'Closed' AND due_date < ? ORDER BY due_date LIMIT 3`,
      [companyId, today]
    );
    const expiringPermits = await db.allAsync(
      `SELECT 'permit' AS alert_type, permit_ref AS ref, title AS text,
         CASE WHEN risk_level = 'C' THEN 'critical' ELSE 'warning' END AS level
       FROM permits WHERE company_id = ? AND status = 'Active' AND expires_at < NOW() + INTERVAL '4 hours'
       ORDER BY expires_at LIMIT 2`,
      [companyId]
    );
    const overdueInspections = await db.allAsync(
      `SELECT 'inspection' AS alert_type, inspection_ref AS ref, name AS text, 'warning' AS level
       FROM inspection_schedule WHERE company_id = ? AND completed_date IS NULL AND scheduled_date < ?
       ORDER BY scheduled_date LIMIT 2`,
      [companyId, today]
    );

    return res.json({
      success: true,
      data: {
        days_without_incident: daysWithoutIncident,
        open_actions: Number(actionStats.open_actions),
        overdue_actions: Number(actionStats.overdue_actions),
        workers_on_site: Number(siteStats.on_site),
        training_compliance_pct: trainingCompliance,
        active_permits: Number(permitStats.active_permits),
        incidents_mtd: Number(incidentMtd.mtd),
        recent_alerts: [...overdueActions, ...expiringPermits, ...overdueInspections].slice(0, 5),
      },
    });
  } catch (err) {
    logger.error('ehsDashboardController.stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard stats.' });
  }
}

module.exports = { stats };
