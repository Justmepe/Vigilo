-- Add companies table and update users for multi-tenant
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry TEXT,
  site_location TEXT,
  contact_email TEXT UNIQUE NOT NULL,
  license_status TEXT DEFAULT 'active',
  license_type TEXT DEFAULT 'standard',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id and invited_by to users
ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN invited_by INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN job_title TEXT;

-- Add company scoping to forms tables (add company_id where missing)
ALTER TABLE forms ADD COLUMN company_id INTEGER REFERENCES companies(id);
ALTER TABLE audit_forms ADD COLUMN company_id INTEGER REFERENCES companies(id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_forms_company ON forms(company_id);
