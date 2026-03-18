-- ============================================================
-- Migration 004: EHS Admin Modules
-- Tables: company_sequences, incidents, actions, inspection_schedule,
--         permits, ppe_inventory, site_attendance, training_records,
--         risk_register, toolbox_talks
-- ============================================================

-- Sequence table for company-scoped auto-IDs
CREATE TABLE IF NOT EXISTS company_sequences (
  company_id    INTEGER NOT NULL,
  sequence_type VARCHAR(50) NOT NULL,
  last_value    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (company_id, sequence_type)
);

-- ─── Incidents ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id             SERIAL PRIMARY KEY,
  company_id     INTEGER NOT NULL,
  incident_ref   VARCHAR(30) NOT NULL,
  incident_date  DATE NOT NULL,
  incident_type  VARCHAR(50) NOT NULL,   -- Near Miss, First Aid, Injury, Property Damage, Spill
  severity       CHAR(1) NOT NULL DEFAULT 'M', -- C H M L
  location       VARCHAR(200),
  description    TEXT,
  reporter_name  VARCHAR(100),
  status         VARCHAR(50) NOT NULL DEFAULT 'Investigating', -- Investigating, Action Raised, Closed
  ai_report      TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_incidents_company ON incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_incidents_date    ON incidents(company_id, incident_date DESC);

-- ─── Actions ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actions (
  id           SERIAL PRIMARY KEY,
  company_id   INTEGER NOT NULL,
  action_ref   VARCHAR(30) NOT NULL,
  title        VARCHAR(500) NOT NULL,
  source_ref   VARCHAR(100),  -- INC-2026-001, Audit-Q1, RSK-001, etc.
  priority     CHAR(1) NOT NULL DEFAULT 'M',  -- C H M L
  owner_name   VARCHAR(100),
  due_date     DATE,
  status       VARCHAR(50) NOT NULL DEFAULT 'Not Started', -- Not Started, In Progress, Overdue, Closed
  progress     INTEGER NOT NULL DEFAULT 0,    -- 0-100
  category     VARCHAR(100),  -- Engineering, Administrative, Training, Maintenance
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_actions_company ON actions(company_id);
CREATE INDEX IF NOT EXISTS idx_actions_status  ON actions(company_id, status);

-- ─── Inspection Schedule ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inspection_schedule (
  id              SERIAL PRIMARY KEY,
  company_id      INTEGER NOT NULL,
  inspection_ref  VARCHAR(30) NOT NULL,
  name            VARCHAR(300) NOT NULL,
  area            VARCHAR(200),
  scheduled_date  DATE NOT NULL,
  completed_date  DATE,
  score           INTEGER,          -- 0–100
  status          VARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- Scheduled, Complete, Overdue
  inspector_name  VARCHAR(100),
  findings_count  INTEGER,
  critical_count  INTEGER,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_insp_sched_company ON inspection_schedule(company_id);

-- ─── Permits to Work ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permits (
  id           SERIAL PRIMARY KEY,
  company_id   INTEGER NOT NULL,
  permit_ref   VARCHAR(30) NOT NULL,
  permit_type  VARCHAR(100) NOT NULL,  -- Hot Work, Confined Space, Electrical, Work at Height, Excavation
  title        VARCHAR(500) NOT NULL,
  location     VARCHAR(200),
  issued_at    TIMESTAMP,
  expires_at   TIMESTAMP,
  issuer_name  VARCHAR(100),
  worker_name  VARCHAR(100),
  status       VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Active, Pending, Closed
  risk_level   CHAR(1) NOT NULL DEFAULT 'M',  -- C H M L
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_permits_company ON permits(company_id);
CREATE INDEX IF NOT EXISTS idx_permits_status  ON permits(company_id, status);

-- ─── PPE Inventory ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ppe_inventory (
  id               SERIAL PRIMARY KEY,
  company_id       INTEGER NOT NULL,
  item_name        VARCHAR(200) NOT NULL,
  category         VARCHAR(100),  -- Head, Eye, Eye/Face, Gas, Respiratory, Hand, Foot, Visibility, Fall Arrest, Hearing, Body
  stock_qty        INTEGER NOT NULL DEFAULT 0,
  min_qty          INTEGER NOT NULL DEFAULT 0,
  unit             VARCHAR(50),   -- ea, pairs
  condition_status VARCHAR(50),   -- Good, Fair, Poor
  compliance_pct   INTEGER,       -- 0-100
  last_audit_date  DATE,
  storage_location VARCHAR(200),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ppe_company ON ppe_inventory(company_id);

-- ─── Site Attendance ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_attendance (
  id               SERIAL PRIMARY KEY,
  company_id       INTEGER NOT NULL,
  worker_name      VARCHAR(100) NOT NULL,
  role             VARCHAR(100),
  shift_name       VARCHAR(50),       -- Day, Afternoon, Night
  shift_supervisor VARCHAR(100),
  area             VARCHAR(200),
  attendance_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  checkin_time     VARCHAR(10),       -- HH:MM string
  ppe_compliant    BOOLEAN,
  status           VARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- On Site, Expected, Scheduled, Left
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_company ON site_attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date    ON site_attendance(company_id, attendance_date);

-- ─── Training Records ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_records (
  id            SERIAL PRIMARY KEY,
  company_id    INTEGER NOT NULL,
  worker_name   VARCHAR(100) NOT NULL,
  role          VARCHAR(100),
  cert_type     VARCHAR(100) NOT NULL,  -- h2s, first_aid, forklift, confined_space, fire_warden, work_at_height, loto
  cert_status   VARCHAR(50) NOT NULL DEFAULT 'valid',  -- valid, expiring_30, expiring_60, expiring_90, expired, not_held
  issued_date   DATE,
  expiry_date   DATE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, worker_name, cert_type)
);
CREATE INDEX IF NOT EXISTS idx_training_company ON training_records(company_id);
CREATE INDEX IF NOT EXISTS idx_training_worker  ON training_records(company_id, worker_name);

-- ─── Risk Register ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_register (
  id                 SERIAL PRIMARY KEY,
  company_id         INTEGER NOT NULL,
  risk_ref           VARCHAR(30) NOT NULL,
  hazard_description TEXT NOT NULL,
  category           VARCHAR(100),   -- Chemical, Physical, Traffic, Electrical, Ergonomic, Environmental, Fire
  likelihood         INTEGER NOT NULL DEFAULT 3,  -- 1-5
  severity_level     INTEGER NOT NULL DEFAULT 3,  -- 1-5
  residual_risk      VARCHAR(10),    -- H, M, L
  control_measures   TEXT,
  owner_name         VARCHAR(100),
  review_date        DATE,
  status             VARCHAR(50) NOT NULL DEFAULT 'Active',  -- Active, Controlled, Overdue
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_risk_company ON risk_register(company_id);

-- ─── Toolbox Talks ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS toolbox_talks (
  id                 SERIAL PRIMARY KEY,
  company_id         INTEGER NOT NULL,
  talk_ref           VARCHAR(30) NOT NULL,
  talk_date          DATE NOT NULL,
  topic              VARCHAR(500) NOT NULL,
  presenter_name     VARCHAR(100),
  scheduled_count    INTEGER NOT NULL DEFAULT 0,
  attended_count     INTEGER,
  duration_mins      INTEGER,
  shift              VARCHAR(50),    -- Day, Afternoon, Night, All
  status             VARCHAR(50) NOT NULL DEFAULT 'Scheduled',  -- Done, Scheduled
  materials_available BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_toolbox_company ON toolbox_talks(company_id);
CREATE INDEX IF NOT EXISTS idx_toolbox_date    ON toolbox_talks(company_id, talk_date DESC);
