/**
 * Incidents Controller — full CRUD for the incidents table
 */
const db = require('../config/database');
const logger = require('../utils/logger');
const { formatId } = require('../services/sequenceService');

/**
 * GET /incidents
 * Query params: type, status, search, limit, offset
 */
async function list(req, res) {
  try {
    const companyId = req.user.company_id;
    const { type, status, search, limit = 50, offset = 0 } = req.query;

    let where = ['i.company_id = ?'];
    const params = [companyId];

    if (type) {
      where.push('i.incident_type = ?');
      params.push(type);
    }
    if (status) {
      where.push('i.status = ?');
      params.push(status);
    }
    if (search) {
      where.push('(i.incident_ref ILIKE ? OR i.description ILIKE ? OR i.location ILIKE ? OR i.reporter_name ILIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereClause = where.join(' AND ');

    const rows = await db.allAsync(
      `SELECT * FROM incidents i WHERE ${whereClause}
       ORDER BY i.incident_date DESC, i.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    // Aggregate counts
    const counts = await db.getAsync(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status != 'Closed') AS open,
         COUNT(*) FILTER (WHERE severity = 'C') AS critical,
         COUNT(*) FILTER (WHERE severity = 'H') AS high
       FROM incidents
       WHERE company_id = ?`,
      [companyId]
    );

    return res.json({
      success: true,
      data: rows,
      counts: {
        total: Number(counts.total),
        open: Number(counts.open),
        critical: Number(counts.critical),
        high: Number(counts.high),
      },
    });
  } catch (err) {
    logger.error('incidentsController.list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve incidents.' });
  }
}

/**
 * POST /incidents
 */
async function create(req, res) {
  try {
    const companyId = req.user.company_id;
    const {
      incident_date,
      incident_type,
      severity,
      location,
      description,
      reporter_name,
      status = 'Open',
    } = req.body;

    const incident_ref = await formatId(companyId, 'incident', 'INC', true);

    const result = await db.runAsync(
      `INSERT INTO incidents
         (company_id, incident_ref, incident_date, incident_type, severity, location, description, reporter_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, incident_ref, incident_date, incident_type, severity, location, description, reporter_name, status]
    );

    const row = await db.getAsync('SELECT * FROM incidents WHERE id = ?', [result.id]);

    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    logger.error('incidentsController.create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create incident.' });
  }
}

/**
 * GET /incidents/:id
 */
async function getById(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;

    const row = await db.getAsync(
      'SELECT * FROM incidents WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    return res.json({ success: true, data: row });
  } catch (err) {
    logger.error('incidentsController.getById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve incident.' });
  }
}

/**
 * PUT /incidents/:id
 */
async function update(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const {
      incident_date,
      incident_type,
      severity,
      location,
      description,
      reporter_name,
      status,
    } = req.body;

    const existing = await db.getAsync(
      'SELECT id FROM incidents WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    await db.runAsync(
      `UPDATE incidents SET
         incident_date = COALESCE(?, incident_date),
         incident_type = COALESCE(?, incident_type),
         severity      = COALESCE(?, severity),
         location      = COALESCE(?, location),
         description   = COALESCE(?, description),
         reporter_name = COALESCE(?, reporter_name),
         status        = COALESCE(?, status),
         updated_at    = NOW()
       WHERE id = ? AND company_id = ?`,
      [incident_date, incident_type, severity, location, description, reporter_name, status, id, companyId]
    );

    const row = await db.getAsync('SELECT * FROM incidents WHERE id = ?', [id]);
    return res.json({ success: true, data: row });
  } catch (err) {
    logger.error('incidentsController.update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update incident.' });
  }
}

/**
 * DELETE /incidents/:id
 */
async function remove(req, res) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;

    const existing = await db.getAsync(
      'SELECT id FROM incidents WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    await db.runAsync('DELETE FROM incidents WHERE id = ? AND company_id = ?', [id, companyId]);

    return res.json({ success: true, message: 'Incident deleted.' });
  } catch (err) {
    logger.error('incidentsController.remove error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete incident.' });
  }
}

module.exports = { list, create, getById, update, remove };
