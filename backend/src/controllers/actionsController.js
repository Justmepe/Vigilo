/**
 * Actions Controller — full CRUD for the actions table
 * Auto-computes 'Overdue' status when due_date < today and status != 'Closed'
 */
const db = require('../config/database');
const logger = require('../utils/logger');
const { formatId } = require('../services/sequenceService');

/**
 * Enrich a row or array of rows — mark Overdue when applicable
 */
function enrichAction(row) {
  if (!row) return row;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (row.status !== 'Closed' && row.due_date) {
    const due = new Date(row.due_date);
    due.setHours(0, 0, 0, 0);
    if (due < today) {
      row.status = 'Overdue';
    }
  }
  return row;
}

/**
 * GET /actions
 * Query params: priority, status, category, search, limit, offset
 */
async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { priority, status, category, search, limit = 50, offset = 0 } = req.query;

    let where = ['company_id = ?'];
    const params = [companyId];

    if (priority) {
      where.push('priority = ?');
      params.push(priority);
    }
    if (status && status !== 'Overdue') {
      // Overdue is computed client-side; filter by stored status otherwise
      where.push('status = ?');
      params.push(status);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (search) {
      where.push('(action_ref ILIKE ? OR title ILIKE ? OR owner_name ILIKE ? OR source_ref ILIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereClause = where.join(' AND ');

    const rows = await db.allAsync(
      `SELECT * FROM actions WHERE ${whereClause}
       ORDER BY due_date ASC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const enriched = rows.map(enrichAction);

    // Filter by Overdue after enrichment if requested
    const filtered = status === 'Overdue' ? enriched.filter(r => r.status === 'Overdue') : enriched;

    // Aggregate counts from the full company dataset
    const today = new Date().toISOString().split('T')[0];
    const counts = await db.getAsync(
      `SELECT
         COUNT(*) FILTER (WHERE status != 'Closed') AS open,
         COUNT(*) FILTER (WHERE due_date < ? AND status != 'Closed') AS overdue,
         COUNT(*) FILTER (WHERE priority = 'Critical' AND status != 'Closed') AS critical
       FROM actions
       WHERE company_id = ?`,
      [today, companyId]
    );

    return res.json({
      success: true,
      data: filtered,
      counts: {
        open: Number(counts.open),
        overdue: Number(counts.overdue),
        critical: Number(counts.critical),
      },
    });
  } catch (err) {
    logger.error('actionsController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve actions.' });
  }
}

/**
 * POST /actions
 */
async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const {
      title,
      source_ref,
      priority,
      owner_name,
      due_date,
      status = 'Open',
      progress = 0,
      category,
    } = req.body;

    const action_ref = await formatId(companyId, 'action', 'ACT', false);

    const result = await db.runAsync(
      `INSERT INTO actions
         (company_id, action_ref, title, source_ref, priority, owner_name, due_date, status, progress, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, action_ref, title, source_ref, priority, owner_name, due_date, status, progress, category]
    );

    const row = await db.getAsync('SELECT * FROM actions WHERE id = ?', [result.id]);
    return res.status(201).json({ success: true, data: enrichAction(row) });
  } catch (err) {
    logger.error('actionsController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create action.' });
  }
}

/**
 * GET /actions/:id
 */
async function getById(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;

    const row = await db.getAsync(
      'SELECT * FROM actions WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: 'Action not found.' });
    }

    return res.json({ success: true, data: enrichAction(row) });
  } catch (err) {
    logger.error('actionsController.getById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve action.' });
  }
}

/**
 * PUT /actions/:id
 */
async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const {
      title,
      source_ref,
      priority,
      owner_name,
      due_date,
      status,
      progress,
      category,
    } = req.body;

    const existing = await db.getAsync(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Action not found.' });
    }

    await db.runAsync(
      `UPDATE actions SET
         title       = COALESCE(?, title),
         source_ref  = COALESCE(?, source_ref),
         priority    = COALESCE(?, priority),
         owner_name  = COALESCE(?, owner_name),
         due_date    = COALESCE(?, due_date),
         status      = COALESCE(?, status),
         progress    = COALESCE(?, progress),
         category    = COALESCE(?, category),
         updated_at  = NOW()
       WHERE id = ? AND company_id = ?`,
      [title, source_ref, priority, owner_name, due_date, status, progress, category, id, companyId]
    );

    const row = await db.getAsync('SELECT * FROM actions WHERE id = ?', [id]);
    return res.json({ success: true, data: enrichAction(row) });
  } catch (err) {
    logger.error('actionsController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update action.' });
  }
}

/**
 * DELETE /actions/:id
 */
async function remove(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;

    const existing = await db.getAsync(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Action not found.' });
    }

    await db.runAsync('DELETE FROM actions WHERE id = ? AND company_id = ?', [id, companyId]);

    return res.json({ success: true, message: 'Action deleted.' });
  } catch (err) {
    logger.error('actionsController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete action.' });
  }
}

module.exports = { list, create, getById, update, remove };
