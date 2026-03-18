/**
 * Training Records Controller — cert tracking + matrix view
 */
const db = require('../config/database');
const logger = require('../utils/logger');

async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { worker, cert_type, cert_status } = req.query;
    let sql = 'SELECT * FROM training_records WHERE company_id = ?';
    const params = [companyId];
    if (worker) { sql += ' AND worker_name ILIKE ?'; params.push(`%${worker}%`); }
    if (cert_type) { sql += ' AND cert_type = ?'; params.push(cert_type); }
    if (cert_status) { sql += ' AND cert_status = ?'; params.push(cert_status); }
    sql += ' ORDER BY worker_name, cert_type';
    const rows = await db.allAsync(sql, params);
    const expiring = rows.filter(r => r.cert_status.startsWith('expiring')).length;
    const expired  = rows.filter(r => r.cert_status === 'expired').length;
    const valid    = rows.filter(r => r.cert_status === 'valid').length;
    return res.json({ success: true, data: rows, counts: { total: rows.length, valid, expiring, expired } });
  } catch (err) {
    logger.error('trainingController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list training records.' });
  }
}

async function matrix(req, res) {
  try {
    const companyId = req.user.company_id;
    const rows = await db.allAsync(
      'SELECT * FROM training_records WHERE company_id = ? ORDER BY worker_name, cert_type',
      [companyId]
    );
    // Build worker → { certs } map
    const workerMap = {};
    for (const r of rows) {
      if (!workerMap[r.worker_name]) workerMap[r.worker_name] = { worker_name: r.worker_name, role: r.role, certs: {} };
      workerMap[r.worker_name].certs[r.cert_type] = r.cert_status;
    }
    return res.json({ success: true, data: Object.values(workerMap) });
  } catch (err) {
    logger.error('trainingController.matrix error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load training matrix.' });
  }
}

async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const { worker_name, role, cert_type, cert_status = 'valid', issued_date, expiry_date } = req.body;
    const result = await db.runAsync(
      `INSERT INTO training_records (company_id, worker_name, role, cert_type, cert_status, issued_date, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (company_id, worker_name, cert_type) DO UPDATE
         SET cert_status = EXCLUDED.cert_status, issued_date = EXCLUDED.issued_date,
             expiry_date = EXCLUDED.expiry_date, role = EXCLUDED.role`,
      [companyId, worker_name, role, cert_type, cert_status, issued_date, expiry_date]
    );
    const row = await db.getAsync('SELECT * FROM training_records WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    logger.error('trainingController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create training record.' });
  }
}

async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { cert_status, issued_date, expiry_date, role } = req.body;
    const existing = await db.getAsync('SELECT id FROM training_records WHERE id = ? AND company_id = ?', [id, companyId]);
    if (!existing) return res.status(404).json({ success: false, message: 'Training record not found.' });
    await db.runAsync(
      `UPDATE training_records SET
         cert_status = COALESCE(?, cert_status), issued_date = COALESCE(?, issued_date),
         expiry_date = COALESCE(?, expiry_date), role = COALESCE(?, role)
       WHERE id = ? AND company_id = ?`,
      [cert_status, issued_date, expiry_date, role, id, companyId]
    );
    const row = await db.getAsync('SELECT * FROM training_records WHERE id = ?', [id]);
    return res.json({ success: true, data: row });
  } catch (err) {
    logger.error('trainingController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update training record.' });
  }
}

async function remove(req, res) {
  try {
    await db.runAsync('DELETE FROM training_records WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    return res.json({ success: true, message: 'Training record deleted.' });
  } catch (err) {
    logger.error('trainingController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete training record.' });
  }
}

module.exports = { list, matrix, create, update, remove };
