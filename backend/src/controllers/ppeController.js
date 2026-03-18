/**
 * PPE Inventory Controller
 */
const db = require('../config/database');
const logger = require('../utils/logger');

async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { category } = req.query;
    let sql = 'SELECT * FROM ppe_inventory WHERE company_id = ?';
    const params = [companyId];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY category, item_name';
    const rows = await db.allAsync(sql, params);
    const mapped = rows.map(r => ({ ...r, low_stock: r.stock_qty < r.min_qty }));
    const lowStock = mapped.filter(r => r.low_stock).length;
    return res.json({ success: true, data: mapped, counts: { total: rows.length, low_stock: lowStock } });
  } catch (err) {
    logger.error('ppeController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list PPE inventory.' });
  }
}

async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const { item_name, category, stock_qty = 0, min_qty = 0, unit, condition_status = 'Good', compliance_pct, last_audit_date, storage_location } = req.body;
    const result = await db.runAsync(
      `INSERT INTO ppe_inventory (company_id, item_name, category, stock_qty, min_qty, unit, condition_status, compliance_pct, last_audit_date, storage_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, item_name, category, stock_qty, min_qty, unit, condition_status, compliance_pct, last_audit_date, storage_location]
    );
    const row = await db.getAsync('SELECT * FROM ppe_inventory WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: { ...row, low_stock: row.stock_qty < row.min_qty } });
  } catch (err) {
    logger.error('ppeController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create PPE item.' });
  }
}

async function getById(req, res) {
  try {
    const row = await db.getAsync('SELECT * FROM ppe_inventory WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    if (!row) return res.status(404).json({ success: false, message: 'PPE item not found.' });
    return res.json({ success: true, data: { ...row, low_stock: row.stock_qty < row.min_qty } });
  } catch (err) {
    logger.error('ppeController.getById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get PPE item.' });
  }
}

async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { item_name, category, stock_qty, min_qty, unit, condition_status, compliance_pct, last_audit_date, storage_location } = req.body;
    const existing = await db.getAsync('SELECT id FROM ppe_inventory WHERE id = ? AND company_id = ?', [id, companyId]);
    if (!existing) return res.status(404).json({ success: false, message: 'PPE item not found.' });
    await db.runAsync(
      `UPDATE ppe_inventory SET
         item_name = COALESCE(?, item_name), category = COALESCE(?, category),
         stock_qty = COALESCE(?, stock_qty), min_qty = COALESCE(?, min_qty),
         unit = COALESCE(?, unit), condition_status = COALESCE(?, condition_status),
         compliance_pct = COALESCE(?, compliance_pct),
         last_audit_date = COALESCE(?, last_audit_date),
         storage_location = COALESCE(?, storage_location),
         updated_at = NOW()
       WHERE id = ? AND company_id = ?`,
      [item_name, category, stock_qty, min_qty, unit, condition_status, compliance_pct, last_audit_date, storage_location, id, companyId]
    );
    const row = await db.getAsync('SELECT * FROM ppe_inventory WHERE id = ?', [id]);
    return res.json({ success: true, data: { ...row, low_stock: row.stock_qty < row.min_qty } });
  } catch (err) {
    logger.error('ppeController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update PPE item.' });
  }
}

async function remove(req, res) {
  try {
    await db.runAsync('DELETE FROM ppe_inventory WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    return res.json({ success: true, message: 'PPE item deleted.' });
  } catch (err) {
    logger.error('ppeController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete PPE item.' });
  }
}

module.exports = { list, create, getById, update, remove };
