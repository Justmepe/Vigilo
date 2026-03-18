/**
 * Permits to Work Controller
 */
const db = require('../config/database');
const logger = require('../utils/logger');
const { formatId } = require('../services/sequenceService');

function applyAutoStatus(row) {
  if (row.status === 'Closed') return row;
  if (row.status === 'Active' && row.expires_at && new Date(row.expires_at) < new Date()) {
    return { ...row, status: 'Closed' };
  }
  return row;
}

async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { type, status, limit = 100, offset = 0 } = req.query;
    let sql = 'SELECT * FROM permits WHERE company_id = ?';
    const params = [companyId];
    if (type) { sql += ' AND permit_type = ?'; params.push(type); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = (await db.allAsync(sql, params)).map(applyAutoStatus);
    const counts = await db.getAsync(
      `SELECT COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'Active') AS active,
         COUNT(*) FILTER (WHERE status = 'Pending') AS pending
       FROM permits WHERE company_id = ?`,
      [companyId]
    );
    return res.json({ success: true, data: rows, counts: { total: Number(counts.total), active: Number(counts.active), pending: Number(counts.pending) } });
  } catch (err) {
    logger.error('permitsController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list permits.' });
  }
}

async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const { permit_type, title, location, issued_at, expires_at, issuer_name, worker_name, status = 'Pending', risk_level = 'M' } = req.body;
    const permit_ref = await formatId(companyId, 'permit', 'PTW', true);
    const result = await db.runAsync(
      `INSERT INTO permits (company_id, permit_ref, permit_type, title, location, issued_at, expires_at, issuer_name, worker_name, status, risk_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, permit_ref, permit_type, title, location, issued_at, expires_at, issuer_name, worker_name, status, risk_level]
    );
    const row = await db.getAsync('SELECT * FROM permits WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: applyAutoStatus(row) });
  } catch (err) {
    logger.error('permitsController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create permit.' });
  }
}

async function getById(req, res) {
  try {
    const row = await db.getAsync('SELECT * FROM permits WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    if (!row) return res.status(404).json({ success: false, message: 'Permit not found.' });
    return res.json({ success: true, data: applyAutoStatus(row) });
  } catch (err) {
    logger.error('permitsController.getById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get permit.' });
  }
}

async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { permit_type, title, location, issued_at, expires_at, issuer_name, worker_name, status, risk_level } = req.body;
    const existing = await db.getAsync('SELECT id FROM permits WHERE id = ? AND company_id = ?', [id, companyId]);
    if (!existing) return res.status(404).json({ success: false, message: 'Permit not found.' });
    await db.runAsync(
      `UPDATE permits SET
         permit_type = COALESCE(?, permit_type), title = COALESCE(?, title),
         location = COALESCE(?, location), issued_at = COALESCE(?, issued_at),
         expires_at = COALESCE(?, expires_at), issuer_name = COALESCE(?, issuer_name),
         worker_name = COALESCE(?, worker_name), status = COALESCE(?, status),
         risk_level = COALESCE(?, risk_level)
       WHERE id = ? AND company_id = ?`,
      [permit_type, title, location, issued_at, expires_at, issuer_name, worker_name, status, risk_level, id, companyId]
    );
    const row = await db.getAsync('SELECT * FROM permits WHERE id = ?', [id]);
    return res.json({ success: true, data: applyAutoStatus(row) });
  } catch (err) {
    logger.error('permitsController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update permit.' });
  }
}

async function remove(req, res) {
  try {
    await db.runAsync('DELETE FROM permits WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    return res.json({ success: true, message: 'Permit deleted.' });
  } catch (err) {
    logger.error('permitsController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete permit.' });
  }
}

module.exports = { list, create, getById, update, remove };
