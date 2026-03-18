/**
 * Toolbox Talks Controller
 */
const db = require('../config/database');
const logger = require('../utils/logger');
const { formatId } = require('../services/sequenceService');

async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { status, shift, limit = 100, offset = 0 } = req.query;
    let sql = 'SELECT * FROM toolbox_talks WHERE company_id = ?';
    const params = [companyId];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (shift && shift !== 'All Shifts') { sql += ' AND shift = ?'; params.push(shift); }
    sql += ' ORDER BY talk_date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = await db.allAsync(sql, params);
    const done = rows.filter(r => r.status === 'Done').length;
    const scheduled = rows.filter(r => r.status === 'Scheduled').length;
    const totalAttended = rows.filter(r => r.attended_count != null).reduce((s, r) => s + r.attended_count, 0);
    return res.json({ success: true, data: rows, counts: { total: rows.length, done, scheduled, total_attended: totalAttended } });
  } catch (err) {
    logger.error('toolboxController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list toolbox talks.' });
  }
}

async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const { talk_date, topic, presenter_name, scheduled_count = 0, attended_count, duration_mins, shift = 'Day', status = 'Scheduled', materials_available = false } = req.body;
    const talk_ref = await formatId(companyId, 'toolbox', 'TBT', true);
    const result = await db.runAsync(
      `INSERT INTO toolbox_talks (company_id, talk_ref, talk_date, topic, presenter_name, scheduled_count, attended_count, duration_mins, shift, status, materials_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, talk_ref, talk_date, topic, presenter_name, scheduled_count, attended_count, duration_mins, shift, status, materials_available]
    );
    const row = await db.getAsync('SELECT * FROM toolbox_talks WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    logger.error('toolboxController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create toolbox talk.' });
  }
}

async function getById(req, res) {
  try {
    const row = await db.getAsync('SELECT * FROM toolbox_talks WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    if (!row) return res.status(404).json({ success: false, message: 'Toolbox talk not found.' });
    return res.json({ success: true, data: row });
  } catch (err) {
    logger.error('toolboxController.getById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get toolbox talk.' });
  }
}

async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { talk_date, topic, presenter_name, scheduled_count, attended_count, duration_mins, shift, status, materials_available } = req.body;
    const existing = await db.getAsync('SELECT id FROM toolbox_talks WHERE id = ? AND company_id = ?', [id, companyId]);
    if (!existing) return res.status(404).json({ success: false, message: 'Toolbox talk not found.' });
    await db.runAsync(
      `UPDATE toolbox_talks SET
         talk_date = COALESCE(?, talk_date), topic = COALESCE(?, topic),
         presenter_name = COALESCE(?, presenter_name),
         scheduled_count = COALESCE(?, scheduled_count),
         attended_count = COALESCE(?, attended_count),
         duration_mins = COALESCE(?, duration_mins),
         shift = COALESCE(?, shift), status = COALESCE(?, status),
         materials_available = COALESCE(?, materials_available)
       WHERE id = ? AND company_id = ?`,
      [talk_date, topic, presenter_name, scheduled_count, attended_count, duration_mins, shift, status, materials_available, id, companyId]
    );
    const row = await db.getAsync('SELECT * FROM toolbox_talks WHERE id = ?', [id]);
    return res.json({ success: true, data: row });
  } catch (err) {
    logger.error('toolboxController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update toolbox talk.' });
  }
}

async function remove(req, res) {
  try {
    await db.runAsync('DELETE FROM toolbox_talks WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    return res.json({ success: true, message: 'Toolbox talk deleted.' });
  } catch (err) {
    logger.error('toolboxController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete toolbox talk.' });
  }
}

module.exports = { list, create, getById, update, remove };
