/**
 * Risk Register Controller
 */
const db = require('../config/database');
const logger = require('../utils/logger');
const { formatId } = require('../services/sequenceService');

async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { category, status, limit = 100, offset = 0 } = req.query;
    let sql = 'SELECT * FROM risk_register WHERE company_id = ?';
    const params = [companyId];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY (likelihood * severity_level) DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = await db.allAsync(sql, params);
    const mapped = rows.map(r => ({ ...r, risk_score: r.likelihood * r.severity_level }));
    const counts = await db.getAsync(
      `SELECT COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'Active') AS active,
         COUNT(*) FILTER (WHERE residual_risk = 'H') AS high
       FROM risk_register WHERE company_id = ?`,
      [companyId]
    );
    return res.json({ success: true, data: mapped, counts: { total: Number(counts.total), active: Number(counts.active), high: Number(counts.high) } });
  } catch (err) {
    logger.error('riskController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list risks.' });
  }
}

async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const { hazard_description, category, likelihood = 3, severity_level = 3, residual_risk, control_measures, owner_name, review_date, status = 'Active' } = req.body;
    const risk_ref = await formatId(companyId, 'risk', 'RSK', false);
    const result = await db.runAsync(
      `INSERT INTO risk_register (company_id, risk_ref, hazard_description, category, likelihood, severity_level, residual_risk, control_measures, owner_name, review_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, risk_ref, hazard_description, category, likelihood, severity_level, residual_risk, control_measures, owner_name, review_date, status]
    );
    const row = await db.getAsync('SELECT * FROM risk_register WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: { ...row, risk_score: row.likelihood * row.severity_level } });
  } catch (err) {
    logger.error('riskController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create risk.' });
  }
}

async function getById(req, res) {
  try {
    const row = await db.getAsync('SELECT * FROM risk_register WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    if (!row) return res.status(404).json({ success: false, message: 'Risk not found.' });
    return res.json({ success: true, data: { ...row, risk_score: row.likelihood * row.severity_level } });
  } catch (err) {
    logger.error('riskController.getById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get risk.' });
  }
}

async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { hazard_description, category, likelihood, severity_level, residual_risk, control_measures, owner_name, review_date, status } = req.body;
    const existing = await db.getAsync('SELECT id FROM risk_register WHERE id = ? AND company_id = ?', [id, companyId]);
    if (!existing) return res.status(404).json({ success: false, message: 'Risk not found.' });
    await db.runAsync(
      `UPDATE risk_register SET
         hazard_description = COALESCE(?, hazard_description), category = COALESCE(?, category),
         likelihood = COALESCE(?, likelihood), severity_level = COALESCE(?, severity_level),
         residual_risk = COALESCE(?, residual_risk), control_measures = COALESCE(?, control_measures),
         owner_name = COALESCE(?, owner_name), review_date = COALESCE(?, review_date),
         status = COALESCE(?, status), updated_at = NOW()
       WHERE id = ? AND company_id = ?`,
      [hazard_description, category, likelihood, severity_level, residual_risk, control_measures, owner_name, review_date, status, id, companyId]
    );
    const row = await db.getAsync('SELECT * FROM risk_register WHERE id = ?', [id]);
    return res.json({ success: true, data: { ...row, risk_score: row.likelihood * row.severity_level } });
  } catch (err) {
    logger.error('riskController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update risk.' });
  }
}

async function remove(req, res) {
  try {
    await db.runAsync('DELETE FROM risk_register WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    return res.json({ success: true, message: 'Risk deleted.' });
  } catch (err) {
    logger.error('riskController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete risk.' });
  }
}

module.exports = { list, create, getById, update, remove };
