/**
 * Inspections Schedule Controller — scheduled inspection tracker
 */
const db = require('../config/database');
const logger = require('../utils/logger');
const { formatId } = require('../services/sequenceService');

function computeStatus(row) {
  if (row.completed_date) return 'Complete';
  const today = new Date().toISOString().split('T')[0];
  if (row.scheduled_date < today) return 'Overdue';
  return 'Scheduled';
}

async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { status, limit = 100, offset = 0 } = req.query;
    let rows = await db.allAsync(
      'SELECT * FROM inspection_schedule WHERE company_id = ? ORDER BY scheduled_date DESC LIMIT ? OFFSET ?',
      [companyId, Number(limit), Number(offset)]
    );
    rows = rows.map(r => ({ ...r, status: computeStatus(r) }));
    if (status) rows = rows.filter(r => r.status === status);
    const complete = rows.filter(r => r.status === 'Complete').length;
    const overdue  = rows.filter(r => r.status === 'Overdue').length;
    const scheduled = rows.filter(r => r.status === 'Scheduled').length;
    const scored = rows.filter(r => r.score != null);
    const avgScore = scored.length ? Math.round(scored.reduce((s, r) => s + r.score, 0) / scored.length) : null;
    return res.json({ success: true, data: rows, counts: { complete, overdue, scheduled, avgScore } });
  } catch (err) {
    logger.error('inspectionsSchedule.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list inspections.' });
  }
}

async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const { name, area, scheduled_date, inspector_name } = req.body;
    const inspection_ref = await formatId(companyId, 'inspection', 'INS', false);
    const result = await db.runAsync(
      `INSERT INTO inspection_schedule (company_id, inspection_ref, name, area, scheduled_date, inspector_name, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')`,
      [companyId, inspection_ref, name, area, scheduled_date, inspector_name]
    );
    const row = await db.getAsync('SELECT * FROM inspection_schedule WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: { ...row, status: computeStatus(row) } });
  } catch (err) {
    logger.error('inspectionsSchedule.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create inspection.' });
  }
}

async function getById(req, res) {
  try {
    const row = await db.getAsync(
      'SELECT * FROM inspection_schedule WHERE id = ? AND company_id = ?',
      [req.params.id, req.user.company_id]
    );
    if (!row) return res.status(404).json({ success: false, message: 'Inspection not found.' });
    return res.json({ success: true, data: { ...row, status: computeStatus(row) } });
  } catch (err) {
    logger.error('inspectionsSchedule.getById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get inspection.' });
  }
}

async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { name, area, scheduled_date, completed_date, score, inspector_name, findings_count, critical_count } = req.body;
    const existing = await db.getAsync('SELECT id FROM inspection_schedule WHERE id = ? AND company_id = ?', [id, companyId]);
    if (!existing) return res.status(404).json({ success: false, message: 'Inspection not found.' });
    await db.runAsync(
      `UPDATE inspection_schedule SET
         name = COALESCE(?, name), area = COALESCE(?, area),
         scheduled_date = COALESCE(?, scheduled_date),
         completed_date = COALESCE(?, completed_date),
         score = COALESCE(?, score),
         inspector_name = COALESCE(?, inspector_name),
         findings_count = COALESCE(?, findings_count),
         critical_count = COALESCE(?, critical_count)
       WHERE id = ? AND company_id = ?`,
      [name, area, scheduled_date, completed_date, score, inspector_name, findings_count, critical_count, id, companyId]
    );
    const row = await db.getAsync('SELECT * FROM inspection_schedule WHERE id = ?', [id]);
    return res.json({ success: true, data: { ...row, status: computeStatus(row) } });
  } catch (err) {
    logger.error('inspectionsSchedule.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update inspection.' });
  }
}

async function remove(req, res) {
  try {
    const companyId = req.user.company_id;
    await db.runAsync('DELETE FROM inspection_schedule WHERE id = ? AND company_id = ?', [req.params.id, companyId]);
    return res.json({ success: true, message: 'Inspection deleted.' });
  } catch (err) {
    logger.error('inspectionsSchedule.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete inspection.' });
  }
}

module.exports = { list, create, getById, update, remove };
