/**
 * Site Attendance Controller
 */
const db = require('../config/database');
const logger = require('../utils/logger');

async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { date, shift, limit = 200, offset = 0 } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    let sql = 'SELECT * FROM site_attendance WHERE company_id = ? AND attendance_date = ?';
    const params = [companyId, targetDate];
    if (shift) { sql += ' AND shift_name = ?'; params.push(shift); }
    sql += ' ORDER BY shift_name, checkin_time LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = await db.allAsync(sql, params);
    // Group by shift
    const byShift = {};
    for (const r of rows) {
      if (!byShift[r.shift_name]) byShift[r.shift_name] = { shift_name: r.shift_name, supervisor: r.shift_supervisor, workers: [] };
      byShift[r.shift_name].workers.push(r);
    }
    const onSite = rows.filter(r => r.status === 'On Site').length;
    return res.json({ success: true, data: rows, shifts: Object.values(byShift), counts: { total: rows.length, on_site: onSite } });
  } catch (err) {
    logger.error('attendanceController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list attendance.' });
  }
}

async function today(req, res) {
  req.query.date = new Date().toISOString().split('T')[0];
  return list(req, res);
}

async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const { worker_name, role, shift_name, shift_supervisor, area, attendance_date, checkin_time, ppe_compliant, status = 'Scheduled' } = req.body;
    const date = attendance_date || new Date().toISOString().split('T')[0];
    const result = await db.runAsync(
      `INSERT INTO site_attendance (company_id, worker_name, role, shift_name, shift_supervisor, area, attendance_date, checkin_time, ppe_compliant, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, worker_name, role, shift_name, shift_supervisor, area, date, checkin_time, ppe_compliant, status]
    );
    const row = await db.getAsync('SELECT * FROM site_attendance WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    logger.error('attendanceController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create attendance record.' });
  }
}

async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { checkin_time, ppe_compliant, status, area } = req.body;
    const existing = await db.getAsync('SELECT id FROM site_attendance WHERE id = ? AND company_id = ?', [id, companyId]);
    if (!existing) return res.status(404).json({ success: false, message: 'Record not found.' });
    await db.runAsync(
      `UPDATE site_attendance SET
         checkin_time = COALESCE(?, checkin_time), ppe_compliant = COALESCE(?, ppe_compliant),
         status = COALESCE(?, status), area = COALESCE(?, area)
       WHERE id = ? AND company_id = ?`,
      [checkin_time, ppe_compliant, status, area, id, companyId]
    );
    const row = await db.getAsync('SELECT * FROM site_attendance WHERE id = ?', [id]);
    return res.json({ success: true, data: row });
  } catch (err) {
    logger.error('attendanceController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update attendance.' });
  }
}

async function remove(req, res) {
  try {
    await db.runAsync('DELETE FROM site_attendance WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
    return res.json({ success: true, message: 'Attendance record deleted.' });
  } catch (err) {
    logger.error('attendanceController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete attendance record.' });
  }
}

module.exports = { list, today, create, update, remove };
