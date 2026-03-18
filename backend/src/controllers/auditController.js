/**
 * Audit Controller — SMART OSHA / NFPA Audit Form
 */
const db = require('../config/database');
const logger = require('../utils/logger');
const auditDocumentService = require('../services/auditDocumentService');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Calculate risk score from severity + repeat finding
 */
function calcRiskScore(severity, repeatFinding, conditionObserved) {
  if (conditionObserved === 'Compliant' || conditionObserved === 'Not Applicable') return 'N/A';
  const sevMap = { Critical: 4, High: 3, Moderate: 2, Low: 1, Other: 1 };
  let score = sevMap[severity] || 2;
  if (repeatFinding === 'Yes') score += 1;
  if (score >= 5) return 'Critical';
  if (score >= 4) return 'High';
  if (score >= 3) return 'Moderate';
  return 'Low';
}

// ─── Question Bank ───────────────────────────────────────────────────────────

exports.getQuestions = async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM audit_question_bank WHERE is_active = 1';
    const params = [];
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY category, id';
    const questions = await db.allAsync(sql, params);
    res.json({ success: true, data: questions });
  } catch (err) {
    logger.error('getQuestions error:', err);
    res.status(500).json({ success: false, message: 'Failed to load questions' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const rows = await db.allAsync(
      'SELECT DISTINCT category FROM audit_question_bank WHERE is_active = 1 ORDER BY category'
    );
    res.json({ success: true, data: rows.map(r => r.category) });
  } catch (err) {
    logger.error('getCategories error:', err);
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Admin only' });
    const { category, question, default_hazard, default_regulation, default_severity } = req.body;
    if (!category || !question) return res.status(400).json({ success: false, message: 'category and question required' });
    const result = await db.runAsync(
      'INSERT INTO audit_question_bank (category, question, default_hazard, default_regulation, default_severity) VALUES (?,?,?,?,?)',
      [category, question, default_hazard || null, default_regulation || null, default_severity || 'Moderate']
    );
    const created = await db.getAsync('SELECT * FROM audit_question_bank WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    logger.error('createQuestion error:', err);
    res.status(500).json({ success: false, message: 'Failed to create question' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Admin only' });
    const { category, question, default_hazard, default_regulation, default_severity, is_active } = req.body;
    await db.runAsync(
      'UPDATE audit_question_bank SET category=?, question=?, default_hazard=?, default_regulation=?, default_severity=?, is_active=? WHERE id=?',
      [category, question, default_hazard, default_regulation, default_severity, is_active ?? 1, req.params.id]
    );
    const updated = await db.getAsync('SELECT * FROM audit_question_bank WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('updateQuestion error:', err);
    res.status(500).json({ success: false, message: 'Failed to update question' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Admin only' });
    await db.runAsync('UPDATE audit_question_bank SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Question deactivated' });
  } catch (err) {
    logger.error('deleteQuestion error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
};

// ─── Audit Forms ─────────────────────────────────────────────────────────────

exports.listAudits = async (req, res) => {
  try {
    const { facility, category, status, limit = 50, offset = 0 } = req.query;
    let sql = `
      SELECT af.*, u.full_name as auditor_user,
        (SELECT COUNT(*) FROM audit_findings WHERE audit_id = af.id) as finding_count,
        (SELECT COUNT(*) FROM audit_findings WHERE audit_id = af.id AND condition_observed = 'Non-Compliant') as non_compliant_count,
        (SELECT COUNT(*) FROM audit_findings WHERE audit_id = af.id AND finding_status != 'Closed') as open_count
      FROM audit_forms af
      LEFT JOIN users u ON u.id = af.user_id
      WHERE 1=1`;
    const params = [];
    if (facility) { sql += ' AND af.facility_name LIKE ?'; params.push(`%${facility}%`); }
    if (category) { sql += ' AND af.audit_category = ?'; params.push(category); }
    if (status)   { sql += ' AND af.status = ?'; params.push(status); }
    sql += ' ORDER BY af.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const audits = await db.allAsync(sql, params);
    // Parse audit_areas JSON
    audits.forEach(a => {
      try { a.audit_areas = JSON.parse(a.audit_areas); } catch { a.audit_areas = []; }
    });
    res.json({ success: true, data: audits });
  } catch (err) {
    logger.error('listAudits error:', err);
    res.status(500).json({ success: false, message: 'Failed to list audits' });
  }
};

exports.createAudit = async (req, res) => {
  try {
    const { facility_name, audit_areas, audit_category, audit_date, auditor_name, findings = [] } = req.body;

    // Validate required fields
    if (!facility_name || !audit_category || !audit_date || !auditor_name) {
      return res.status(400).json({ success: false, message: 'facility_name, audit_category, audit_date, and auditor_name are required' });
    }

    const areasJson = JSON.stringify(Array.isArray(audit_areas) ? audit_areas : []);

    // Insert the audit form
    const auditResult = await db.runAsync(
      `INSERT INTO audit_forms (user_id, facility_name, audit_areas, audit_category, audit_date, auditor_name, status)
       VALUES (?, ?, ?, ?, ?, ?, 'submitted')`,
      [req.user.id, facility_name, areasJson, audit_category, audit_date, auditor_name]
    );
    const auditId = auditResult.id;

    // Parse findings if provided as string
    let parsedFindings = findings;
    if (typeof findings === 'string') {
      try { parsedFindings = JSON.parse(findings); } catch { parsedFindings = []; }
    }

    // Insert each finding
    for (let i = 0; i < parsedFindings.length; i++) {
      const f = parsedFindings[i];
      const riskScore = calcRiskScore(f.severity, f.repeat_finding, f.condition_observed);
      await db.runAsync(
        `INSERT INTO audit_findings
          (audit_id, finding_number, location, question_id, audit_question, condition_observed,
           description, hazard_type, regulation, severity, repeat_finding, photo_path,
           immediate_action, corrective_action, responsible_party, target_date, finding_status, risk_score)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          auditId,
          i + 1,
          f.location || '',
          f.question_id || null,
          f.audit_question || '',
          f.condition_observed || 'Compliant',
          f.description || null,
          f.hazard_type || null,
          f.regulation || null,
          f.severity || 'Moderate',
          f.repeat_finding || 'Unknown',
          f.photo_path || null,
          f.immediate_action || null,
          f.corrective_action || null,
          f.responsible_party || null,
          f.target_date || null,
          f.finding_status || 'Open',
          riskScore
        ]
      );
    }

    // Fetch the complete audit with findings
    const audit = await db.getAsync('SELECT * FROM audit_forms WHERE id = ?', [auditId]);
    const auditFindings = await db.allAsync('SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY finding_number', [auditId]);

    // Generate AI report + docx asynchronously
    setImmediate(() => generateAuditDocument(auditId));

    logger.info(`Audit created: id=${auditId} by user=${req.user.id}`);
    res.status(201).json({
      success: true,
      data: { ...audit, findings: auditFindings },
      message: 'Audit submitted. Document generation in progress.'
    });
  } catch (err) {
    logger.error('createAudit error:', err);
    res.status(500).json({ success: false, message: 'Failed to create audit' });
  }
};

exports.getAudit = async (req, res) => {
  try {
    const audit = await db.getAsync('SELECT * FROM audit_forms WHERE id = ?', [req.params.id]);
    if (!audit) return res.status(404).json({ success: false, message: 'Audit not found' });
    const findings = await db.allAsync(
      'SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY finding_number',
      [req.params.id]
    );
    try { audit.audit_areas = JSON.parse(audit.audit_areas); } catch { audit.audit_areas = []; }
    res.json({ success: true, data: { ...audit, findings } });
  } catch (err) {
    logger.error('getAudit error:', err);
    res.status(500).json({ success: false, message: 'Failed to get audit' });
  }
};

exports.updateAudit = async (req, res) => {
  try {
    const { status } = req.body;
    await db.runAsync(
      'UPDATE audit_forms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );
    const updated = await db.getAsync('SELECT * FROM audit_forms WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('updateAudit error:', err);
    res.status(500).json({ success: false, message: 'Failed to update audit' });
  }
};

exports.deleteAudit = async (req, res) => {
  try {
    await db.runAsync('DELETE FROM audit_forms WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Audit deleted' });
  } catch (err) {
    logger.error('deleteAudit error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete audit' });
  }
};

exports.getFindings = async (req, res) => {
  try {
    const findings = await db.allAsync(
      'SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY finding_number',
      [req.params.id]
    );
    res.json({ success: true, data: findings });
  } catch (err) {
    logger.error('getFindings error:', err);
    res.status(500).json({ success: false, message: 'Failed to get findings' });
  }
};

exports.updateFinding = async (req, res) => {
  try {
    const { finding_status, date_closed, corrective_action, responsible_party, target_date } = req.body;
    const autoDateClosed = finding_status === 'Closed' ? new Date().toISOString().split('T')[0] : date_closed;
    await db.runAsync(
      `UPDATE audit_findings
       SET finding_status=?, date_closed=?, corrective_action=?, responsible_party=?, target_date=?
       WHERE id=? AND audit_id=?`,
      [finding_status, autoDateClosed || null, corrective_action || null, responsible_party || null, target_date || null,
       req.params.findingId, req.params.auditId]
    );
    const updated = await db.getAsync('SELECT * FROM audit_findings WHERE id = ?', [req.params.findingId]);
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('updateFinding error:', err);
    res.status(500).json({ success: false, message: 'Failed to update finding' });
  }
};

// ─── Document Export ─────────────────────────────────────────────────────────

exports.exportDocx = async (req, res) => {
  try {
    const audit = await db.getAsync('SELECT * FROM audit_forms WHERE id = ?', [req.params.id]);
    if (!audit) return res.status(404).json({ success: false, message: 'Audit not found' });
    const findings = await db.allAsync(
      'SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY finding_number',
      [req.params.id]
    );
    try { audit.audit_areas = JSON.parse(audit.audit_areas); } catch { audit.audit_areas = []; }

    const buffer = await auditDocumentService.generateDocx(audit, findings);
    const filename = `OSHA_Audit_${audit.facility_name.replace(/\s+/g, '_')}_${audit.audit_date}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    logger.error('exportDocx error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate document' });
  }
};

// ─── Background: AI + Document Generation ────────────────────────────────────

async function generateAuditDocument(auditId) {
  try {
    const audit = await db.getAsync('SELECT * FROM audit_forms WHERE id = ?', [auditId]);
    const findings = await db.allAsync(
      'SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY finding_number',
      [auditId]
    );
    try { audit.audit_areas = JSON.parse(audit.audit_areas); } catch { audit.audit_areas = []; }

    const aiReport = await auditDocumentService.generateAIReport(audit, findings);
    await db.runAsync(
      'UPDATE audit_forms SET ai_report = ?, ai_report_generated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [aiReport, auditId]
    );
    logger.info(`AI report generated for audit ${auditId}`);
  } catch (err) {
    logger.error(`Background AI generation failed for audit ${auditId}:`, err.message);
  }
}
