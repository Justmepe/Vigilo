/**
 * Admin Controller
 * Handles all admin-only operations:
 *   - Document management (all users, all form types)
 *   - User management
 *   - SharePoint sync
 *   - Dashboard stats
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const sharepointService = require('../services/sharepointService');
const path = require('path');
const fs = require('fs');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requireAdmin(req, res) {
  if (!['Admin', 'SuperAdmin'].includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return false;
  }
  return true;
}

const FORM_TYPE_LABELS = {
  jsa: 'Job Safety Analysis',
  loto: 'Lockout/Tagout',
  injury: 'Injury Report',
  accident: 'Accident Report',
  spillReport: 'Spill/Release Report',
  monthlyInspection: 'Hygiene Inspection',
  oshaAudit: 'OSHA/NFPA Audit',
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

exports.getAdminStats = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [
      totalForms,
      totalAudits,
      archivedForms,
      archivedAudits,
      pendingSync,
      failedSync,
      totalUsers,
      activeUsers,
      thisMonthForms,
      thisMonthAudits,
      criticalFindings,
    ] = await Promise.all([
      db.getAsync('SELECT COUNT(*) as count FROM forms WHERE archived_at IS NULL'),
      db.getAsync('SELECT COUNT(*) as count FROM audit_forms WHERE archived_at IS NULL'),
      db.getAsync('SELECT COUNT(*) as count FROM forms WHERE archived_at IS NOT NULL'),
      db.getAsync('SELECT COUNT(*) as count FROM audit_forms WHERE archived_at IS NOT NULL'),
      db.getAsync(`SELECT COUNT(*) as count FROM forms WHERE sharepoint_status = 'pending' AND archived_at IS NULL
        UNION ALL SELECT COUNT(*) FROM audit_forms WHERE sharepoint_status = 'pending' AND archived_at IS NULL`),
      db.getAsync(`SELECT (
        SELECT COUNT(*) FROM forms WHERE sharepoint_status = 'failed') +
        (SELECT COUNT(*) FROM audit_forms WHERE sharepoint_status = 'failed'
      ) as count`),
      db.getAsync('SELECT COUNT(*) as count FROM users'),
      db.getAsync('SELECT COUNT(*) as count FROM users WHERE is_active = 1'),
      db.getAsync(`SELECT COUNT(*) as count FROM forms WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`),
      db.getAsync(`SELECT COUNT(*) as count FROM audit_forms WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`),
      db.getAsync(`SELECT COUNT(*) as count FROM audit_findings WHERE severity = 'Critical' AND finding_status != 'Closed'`),
    ]);

    const syncPending = await db.allAsync(
      `SELECT COUNT(*) as count FROM forms WHERE sharepoint_status = 'pending' AND archived_at IS NULL`
    );
    const auditSyncPending = await db.allAsync(
      `SELECT COUNT(*) as count FROM audit_forms WHERE sharepoint_status = 'pending' AND archived_at IS NULL`
    );

    res.json({
      success: true,
      data: {
        documents: {
          total: (totalForms?.count || 0) + (totalAudits?.count || 0),
          forms: totalForms?.count || 0,
          audits: totalAudits?.count || 0,
          archived: (archivedForms?.count || 0) + (archivedAudits?.count || 0),
          thisMonth: (thisMonthForms?.count || 0) + (thisMonthAudits?.count || 0),
        },
        users: {
          total: totalUsers?.count || 0,
          active: activeUsers?.count || 0,
        },
        sharepoint: {
          configured: sharepointService.isConfigured(),
          pendingSync: (syncPending[0]?.count || 0) + (auditSyncPending[0]?.count || 0),
          failedSync: failedSync?.count || 0,
        },
        findings: {
          criticalOpen: criticalFindings?.count || 0,
        },
      },
    });
  } catch (err) {
    logger.error('getAdminStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
};

// ─── Document Management ──────────────────────────────────────────────────────

/**
 * GET /api/admin/documents
 * List all documents across all form types with user info
 * Query params: type, status, userId, facility, dateFrom, dateTo, search, archived, page, limit
 */
exports.getAllDocuments = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const {
      type,
      status,
      userId,
      facility,
      dateFrom,
      dateTo,
      search,
      archived = 'false',
      page = 1,
      limit = 50,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const showArchived = archived === 'true';

    // ── Generic forms ─────────────────────────────────────────────────────
    let formSql = `
      SELECT
        f.id,
        f.form_type as type,
        f.status,
        f.created_at,
        f.updated_at,
        f.ai_report IS NOT NULL as has_ai_report,
        f.sharepoint_status,
        f.sharepoint_url,
        f.archived_at,
        f.form_data,
        u.id as user_id,
        u.full_name as user_name,
        u.username,
        u.facility,
        u.department,
        'form' as source
      FROM forms f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE 1=1
    `;
    const formParams = [];

    if (showArchived) {
      formSql += ' AND f.archived_at IS NOT NULL';
    } else {
      formSql += ' AND f.archived_at IS NULL';
    }

    if (type && type !== 'oshaAudit') {
      formSql += ' AND f.form_type = ?';
      formParams.push(type);
    } else if (type === 'oshaAudit') {
      // Handled in audit query below; exclude from forms
      formSql += ' AND 1=0';
    }

    if (status) { formSql += ' AND f.status = ?'; formParams.push(status); }
    if (userId) { formSql += ' AND f.user_id = ?'; formParams.push(userId); }
    if (facility) { formSql += ' AND u.facility = ?'; formParams.push(facility); }
    if (dateFrom) { formSql += ' AND f.created_at >= ?'; formParams.push(dateFrom); }
    if (dateTo) { formSql += ' AND f.created_at <= ?'; formParams.push(dateTo + 'T23:59:59'); }
    if (search) {
      formSql += ' AND (f.form_data LIKE ? OR u.full_name LIKE ? OR u.username LIKE ?)';
      const q = `%${search}%`;
      formParams.push(q, q, q);
    }

    // ── Audit forms ───────────────────────────────────────────────────────
    let auditSql = `
      SELECT
        a.id,
        'oshaAudit' as type,
        a.status,
        a.created_at,
        a.updated_at,
        a.ai_report IS NOT NULL as has_ai_report,
        a.sharepoint_status,
        a.sharepoint_url,
        a.archived_at,
        json_object(
          'facility_name', a.facility_name,
          'audit_date', a.audit_date,
          'auditor_name', a.auditor_name,
          'audit_category', a.audit_category,
          'document_path', a.document_path
        ) as form_data,
        u.id as user_id,
        u.full_name as user_name,
        u.username,
        u.facility,
        u.department,
        'audit' as source
      FROM audit_forms a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const auditParams = [];

    if (showArchived) {
      auditSql += ' AND a.archived_at IS NOT NULL';
    } else {
      auditSql += ' AND a.archived_at IS NULL';
    }

    if (type && type !== 'oshaAudit') {
      auditSql += ' AND 1=0'; // Exclude audits if filtering by other type
    }

    if (status) { auditSql += ' AND a.status = ?'; auditParams.push(status); }
    if (userId) { auditSql += ' AND a.user_id = ?'; auditParams.push(userId); }
    if (facility) { auditSql += ' AND (u.facility = ? OR a.facility_name = ?)'; auditParams.push(facility, facility); }
    if (dateFrom) { auditSql += ' AND a.created_at >= ?'; auditParams.push(dateFrom); }
    if (dateTo) { auditSql += ' AND a.created_at <= ?'; auditParams.push(dateTo + 'T23:59:59'); }
    if (search) {
      auditSql += ' AND (a.facility_name LIKE ? OR a.auditor_name LIKE ? OR u.full_name LIKE ?)';
      const q = `%${search}%`;
      auditParams.push(q, q, q);
    }

    const [formRows, auditRows] = await Promise.all([
      db.allAsync(formSql, formParams),
      db.allAsync(auditSql, auditParams),
    ]);

    // Combine, parse form_data, add label, sort by created_at desc
    const combined = [...formRows, ...auditRows]
      .map(row => {
        let parsedData = {};
        try { parsedData = JSON.parse(row.form_data || '{}'); } catch {}
        return {
          ...row,
          form_data: parsedData,
          type_label: FORM_TYPE_LABELS[row.type] || row.type,
          has_ai_report: !!row.has_ai_report,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = combined.length;
    const paginated = combined.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    logger.error('getAllDocuments error:', err);
    res.status(500).json({ success: false, message: 'Failed to load documents' });
  }
};

/**
 * GET /api/admin/documents/:id?source=form|audit
 */
exports.getDocumentById = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { source = 'form' } = req.query;

    let row;
    if (source === 'audit') {
      row = await db.getAsync(
        `SELECT a.*, u.full_name as user_name, u.username, u.facility, u.department, u.email as user_email
         FROM audit_forms a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?`,
        [id]
      );
      if (row) {
        row.findings = await db.allAsync(
          'SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY finding_number',
          [id]
        );
        row.type = 'oshaAudit';
        row.source = 'audit';
      }
    } else {
      row = await db.getAsync(
        `SELECT f.*, u.full_name as user_name, u.username, u.facility, u.department, u.email as user_email
         FROM forms f LEFT JOIN users u ON f.user_id = u.id WHERE f.id = ?`,
        [id]
      );
      if (row) {
        try { row.form_data = JSON.parse(row.form_data); } catch {}
        row.source = 'form';
      }
    }

    if (!row) return res.status(404).json({ success: false, message: 'Document not found' });

    res.json({ success: true, data: row });
  } catch (err) {
    logger.error('getDocumentById error:', err);
    res.status(500).json({ success: false, message: 'Failed to load document' });
  }
};

/**
 * PATCH /api/admin/documents/:id/status
 * Body: { status: 'reviewed' | 'submitted' | 'draft' }
 */
exports.updateDocumentStatus = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { status, source = 'form' } = req.body;

    const allowed = ['draft', 'submitted', 'reviewed', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const table = source === 'audit' ? 'audit_forms' : 'forms';
    await db.runAsync(
      `UPDATE ${table} SET status = ?, updated_at = ? WHERE id = ?`,
      [status, new Date().toISOString(), id]
    );

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    logger.error('updateDocumentStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/**
 * POST /api/admin/documents/:id/archive
 * Archives a document in DB and moves it on SharePoint
 */
exports.archiveDocument = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { source = 'form' } = req.body;

    const table = source === 'audit' ? 'audit_forms' : 'forms';
    const row = await db.getAsync(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!row) return res.status(404).json({ success: false, message: 'Document not found' });
    if (row.archived_at) return res.status(400).json({ success: false, message: 'Already archived' });

    // Archive in DB
    await db.runAsync(
      `UPDATE ${table} SET archived_at = ?, archived_by = ?, status = 'archived' WHERE id = ?`,
      [new Date().toISOString(), req.user.id, id]
    );

    // Move on SharePoint if synced
    if (row.sharepoint_file_id && sharepointService.isConfigured()) {
      const formType = source === 'audit' ? 'oshaAudit' : row.form_type;
      setImmediate(async () => {
        try {
          await sharepointService.archiveFile(row.sharepoint_file_id, formType);
          logger.info(`[Admin] SharePoint archive complete for ${table}#${id}`);
        } catch (err) {
          logger.error(`[Admin] SharePoint archive failed for ${table}#${id}:`, err.message);
        }
      });
    }

    logger.info(`[Admin] Document archived: ${table}#${id} by user ${req.user.id}`);
    res.json({ success: true, message: 'Document archived' });
  } catch (err) {
    logger.error('archiveDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to archive document' });
  }
};

/**
 * POST /api/admin/documents/:id/unarchive
 */
exports.unarchiveDocument = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { source = 'form' } = req.body;
    const table = source === 'audit' ? 'audit_forms' : 'forms';

    await db.runAsync(
      `UPDATE ${table} SET archived_at = NULL, archived_by = NULL, status = 'submitted' WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Document unarchived' });
  } catch (err) {
    logger.error('unarchiveDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to unarchive' });
  }
};

/**
 * DELETE /api/admin/documents/:id
 * Hard delete — also removes from SharePoint
 */
exports.deleteDocument = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { source = 'form' } = req.query;
    const table = source === 'audit' ? 'audit_forms' : 'forms';

    const row = await db.getAsync(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!row) return res.status(404).json({ success: false, message: 'Document not found' });

    // Delete from SharePoint
    if (row.sharepoint_file_id && sharepointService.isConfigured()) {
      setImmediate(async () => {
        try { await sharepointService.deleteFile(row.sharepoint_file_id); } catch {}
      });
    }

    await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    logger.error('deleteDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};

// ─── User Management ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { search, role, facility, active } = req.query;
    // Scope to the admin's own company
    const company_id = req.user.company_id;
    let sql = `SELECT id, username, email, full_name, job_title, facility, department,
               role, is_active, created_at, last_login FROM users WHERE company_id = ?`;
    const params = [company_id];

    if (search) {
      sql += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    if (role) { sql += ' AND role = ?'; params.push(role); }
    if (facility) { sql += ' AND facility = ?'; params.push(facility); }
    if (active !== undefined) { sql += ' AND is_active = ?'; params.push(active === 'true' ? 1 : 0); }

    sql += ' ORDER BY created_at DESC';
    const users = await db.allAsync(sql, params);
    res.json({ success: true, data: users });
  } catch (err) {
    logger.error('getAllUsers error:', err);
    res.status(500).json({ success: false, message: 'Failed to load users' });
  }
};

/**
 * Generate a random temporary password: e.g. Vigilo@4F2x9
 */
function generateTempPassword() {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const special = '@#$!';
  const rand = (str) => str[Math.floor(Math.random() * str.length)];
  const body = Array.from({ length: 5 }, () =>
    rand(upper + lower + digits)
  ).join('');
  // Guaranteed: 1 upper + 1 digit + 1 special + 5 random
  const pw = rand(upper) + rand(digits) + rand(special) + body;
  // Shuffle
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * POST /api/admin/users
 * If no password is supplied, one is auto-generated and returned in plain text
 * so the admin can share it with the new user.
 */
exports.createUser = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { username, email, password, full_name, job_title, facility, department, role } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'username is required' });
    }

    const existing = await db.getAsync('SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)', [username, email || '']);
    if (existing) return res.status(409).json({ success: false, message: 'Username or email already exists' });

    // Use supplied password or auto-generate one
    const plainPassword = password && password.length >= 6 ? password : generateTempPassword();
    const hash = await bcrypt.hash(plainPassword, 10);

    const company_id = req.user.company_id;
    const safeRole = ['Admin', 'Supervisor', 'User'].includes(role) ? role : 'User';
    await db.runAsync(
      `INSERT INTO users (username, email, password_hash, full_name, job_title, facility, department, role, company_id, invited_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [username, email || null, hash, full_name || null, job_title || null, facility || null, department || null, safeRole, company_id, req.user.id]
    );

    const created = await db.getAsync('SELECT id, username, email, full_name, role, company_id FROM users WHERE username = ?', [username]);
    logger.info('Admin created user', { adminId: req.user.id, newUser: username, role: safeRole });

    res.status(201).json({
      success: true,
      data: created,
      // Return the plain-text password so admin can share credentials
      temporaryPassword: plainPassword,
      passwordWasGenerated: !(password && password.length >= 6),
      message: 'User created',
    });
  } catch (err) {
    logger.error('createUser error:', err);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

/**
 * PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { full_name, email, job_title, facility, department, role } = req.body;

    await db.runAsync(
      `UPDATE users SET full_name = ?, email = ?, job_title = ?, facility = ?,
       department = ?, role = ?, updated_at = ? WHERE id = ?`,
      [full_name, email, job_title, facility, department, role, new Date().toISOString(), id]
    );

    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    logger.error('updateUser error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

/**
 * PATCH /api/admin/users/:id/toggle-active
 */
exports.toggleUserActive = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    const user = await db.getAsync('SELECT is_active FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newState = user.is_active ? 0 : 1;
    await db.runAsync('UPDATE users SET is_active = ? WHERE id = ?', [newState, id]);

    res.json({ success: true, message: newState ? 'User activated' : 'User deactivated', is_active: newState });
  } catch (err) {
    logger.error('toggleUserActive error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
};

/**
 * POST /api/admin/users/:id/reset-password
 */
exports.resetUserPassword = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await db.runAsync('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    logger.error('resetUserPassword error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

// ─── SharePoint Sync ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/sync/status
 */
exports.getSyncStatus = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [syncedForms, pendingForms, failedForms, syncedAudits, pendingAudits, failedAudits] =
      await Promise.all([
        db.getAsync(`SELECT COUNT(*) as count FROM forms WHERE sharepoint_status = 'synced'`),
        db.getAsync(`SELECT COUNT(*) as count FROM forms WHERE sharepoint_status = 'pending' AND archived_at IS NULL`),
        db.getAsync(`SELECT COUNT(*) as count FROM forms WHERE sharepoint_status = 'failed'`),
        db.getAsync(`SELECT COUNT(*) as count FROM audit_forms WHERE sharepoint_status = 'synced'`),
        db.getAsync(`SELECT COUNT(*) as count FROM audit_forms WHERE sharepoint_status = 'pending' AND archived_at IS NULL`),
        db.getAsync(`SELECT COUNT(*) as count FROM audit_forms WHERE sharepoint_status = 'failed'`),
      ]);

    const failedList = await db.allAsync(
      `SELECT id, form_type as type, created_at, 'form' as source FROM forms WHERE sharepoint_status = 'failed'
       UNION ALL
       SELECT id, 'oshaAudit' as type, created_at, 'audit' as source FROM audit_forms WHERE sharepoint_status = 'failed'
       ORDER BY created_at DESC LIMIT 20`
    );

    res.json({
      success: true,
      data: {
        configured: sharepointService.isConfigured(),
        forms: { synced: syncedForms?.count || 0, pending: pendingForms?.count || 0, failed: failedForms?.count || 0 },
        audits: { synced: syncedAudits?.count || 0, pending: pendingAudits?.count || 0, failed: failedAudits?.count || 0 },
        failedItems: failedList,
      },
    });
  } catch (err) {
    logger.error('getSyncStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to load sync status' });
  }
};

/**
 * POST /api/admin/sync/:id
 * Manually trigger sync for a single document (re-upload its exported file)
 */
exports.syncDocument = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    if (!sharepointService.isConfigured()) {
      return res.status(503).json({ success: false, message: 'SharePoint is not configured' });
    }

    const { id } = req.params;
    const { source = 'form' } = req.body;
    const table = source === 'audit' ? 'audit_forms' : 'forms';

    const row = await db.getAsync(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!row) return res.status(404).json({ success: false, message: 'Document not found' });

    // For audits, use document_path; for forms, look in pdfs dir
    let localPath = null;
    let fileName = null;
    let formType = source === 'audit' ? 'oshaAudit' : row.form_type;

    if (source === 'audit' && row.document_path) {
      localPath = row.document_path;
      fileName = path.basename(localPath);
    } else {
      // Check for an exported PDF in the pdfs directory
      const pdfDir = path.join(__dirname, '../../pdfs');
      const possibleFile = `${row.form_type}_${id}.pdf`;
      const fullPath = path.join(pdfDir, possibleFile);
      if (fs.existsSync(fullPath)) {
        localPath = fullPath;
        fileName = possibleFile;
      }
    }

    if (!localPath || !fs.existsSync(localPath)) {
      return res.status(400).json({
        success: false,
        message: 'No exported document found to sync. Export the document first.',
      });
    }

    const folder = row.archived_at
      ? `Archived/${sharepointService._folderForType(formType)}`
      : `Active/${sharepointService._folderForType(formType)}`;

    const result = await sharepointService.uploadFile(localPath, folder, fileName);

    if (result) {
      await db.runAsync(
        `UPDATE ${table} SET sharepoint_file_id = ?, sharepoint_url = ?,
         sharepoint_synced_at = ?, sharepoint_status = 'synced' WHERE id = ?`,
        [result.fileId, result.webUrl, new Date().toISOString(), id]
      );
    }

    res.json({ success: true, message: 'Sync complete', data: result });
  } catch (err) {
    logger.error('syncDocument error:', err);
    // Mark as failed in DB
    const table = req.body?.source === 'audit' ? 'audit_forms' : 'forms';
    await db.runAsync(`UPDATE ${table} SET sharepoint_status = 'failed' WHERE id = ?`, [req.params.id]).catch(() => {});
    res.status(500).json({ success: false, message: 'Sync failed: ' + err.message });
  }
};

/**
 * POST /api/admin/sync/retry-failed
 * Retry all failed syncs — marks them pending for next export cycle
 */
exports.retryFailedSync = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [r1, r2] = await Promise.all([
      db.runAsync(`UPDATE forms SET sharepoint_status = 'pending' WHERE sharepoint_status = 'failed'`),
      db.runAsync(`UPDATE audit_forms SET sharepoint_status = 'pending' WHERE sharepoint_status = 'failed'`),
    ]);

    res.json({ success: true, message: 'Failed items marked for retry', count: (r1.changes || 0) + (r2.changes || 0) });
  } catch (err) {
    logger.error('retryFailedSync error:', err);
    res.status(500).json({ success: false, message: 'Failed to retry' });
  }
};

// ─── Company Settings ──────────────────────────────────────────────────────────

const SETTINGS_FIELDS = [
  'company_name', 'company_logo_url', 'primary_color', 'accent_color',
  'contact_name', 'contact_email', 'contact_phone', 'physical_address',
  'report_footer', 'report_header_note',
  'industry', 'site_location', 'safety_officer', 'emergency_number',
];

/**
 * GET /api/admin/settings
 */
exports.getCompanySettings = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const company_id = req.user.company_id || null;
    const row = company_id
      ? await db.getAsync('SELECT * FROM company_settings WHERE company_id = ?', [company_id])
      : await db.getAsync('SELECT * FROM company_settings ORDER BY id ASC LIMIT 1');

    res.json({ success: true, data: row || {} });
  } catch (err) {
    logger.error('getCompanySettings error:', err);
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

/**
 * PUT /api/admin/settings
 */
exports.updateCompanySettings = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const company_id = req.user.company_id || null;
    const values = SETTINGS_FIELDS.map(f => req.body[f] ?? null);
    const now = new Date().toISOString();

    const existing = company_id
      ? await db.getAsync('SELECT id FROM company_settings WHERE company_id = ?', [company_id])
      : await db.getAsync('SELECT id FROM company_settings ORDER BY id ASC LIMIT 1');

    if (existing) {
      const setClauses = SETTINGS_FIELDS.map(f => `${f} = ?`).join(', ');
      await db.runAsync(
        `UPDATE company_settings SET ${setClauses}, updated_at = ?, updated_by = ? WHERE id = ?`,
        [...values, now, req.user.id, existing.id]
      );
    } else {
      const cols = ['company_id', ...SETTINGS_FIELDS, 'updated_at', 'updated_by'].join(', ');
      const placeholders = ['company_id', ...SETTINGS_FIELDS, 'updated_at', 'updated_by'].map(() => '?').join(', ');
      await db.runAsync(
        `INSERT INTO company_settings (${cols}) VALUES (${placeholders})`,
        [company_id, ...values, now, req.user.id]
      );
    }

    logger.info('Company settings updated', { adminId: req.user.id, company_id });
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) {
    logger.error('updateCompanySettings error:', err);
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
};
