/**
 * Sequence Service — generates company-scoped sequential IDs like INC-2026-001
 */
const db = require('../config/database');

async function nextVal(companyId, seqType) {
  // Use db.query() directly — company_sequences has no 'id' column so runAsync's
  // automatic RETURNING id would fail with "column id does not exist"
  await db.query(
    `INSERT INTO company_sequences (company_id, sequence_type, last_value)
     VALUES ($1, $2, 1)
     ON CONFLICT (company_id, sequence_type) DO UPDATE
       SET last_value = company_sequences.last_value + 1`,
    [companyId, seqType]
  );
  const row = await db.getAsync(
    'SELECT last_value FROM company_sequences WHERE company_id = ? AND sequence_type = ?',
    [companyId, seqType]
  );
  return row.last_value;
}

async function formatId(companyId, seqType, prefix, withYear = false) {
  const val = await nextVal(companyId, seqType);
  const num  = String(val).padStart(3, '0');
  if (withYear) {
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${num}`;
  }
  return `${prefix}-${num}`;
}

module.exports = { nextVal, formatId };
