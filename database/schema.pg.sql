-- ============================================================
-- Vigilo EHS — PostgreSQL Schema
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  username         TEXT UNIQUE NOT NULL,
  email            TEXT UNIQUE,
  password_hash    TEXT NOT NULL,
  full_name        TEXT,
  job_title        TEXT,
  facility         TEXT,
  department       TEXT,
  role             TEXT DEFAULT 'User',
  company_id       INTEGER,
  is_active        INTEGER DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login       TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  industry         TEXT,
  site_location    TEXT,
  contact_email    TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JSA Forms table
CREATE TABLE IF NOT EXISTS jsa_forms (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  department       TEXT NOT NULL,
  job_description  TEXT,
  location         TEXT,
  date_created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status           TEXT DEFAULT 'draft'
);

-- LOTO Assessments table
CREATE TABLE IF NOT EXISTS loto_assessments (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  facility         TEXT NOT NULL,
  equipment_name   TEXT NOT NULL,
  date_created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status           TEXT DEFAULT 'draft'
);

-- Injury Reports table
CREATE TABLE IF NOT EXISTS injury_reports (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  employee_name    TEXT NOT NULL,
  date_of_injury   TIMESTAMP,
  description      TEXT,
  severity         TEXT,
  status           TEXT DEFAULT 'draft',
  date_created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action Items table
CREATE TABLE IF NOT EXISTS action_items (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  assigned_to      INTEGER REFERENCES users(id),
  title            TEXT NOT NULL,
  description      TEXT,
  due_date         TIMESTAMP,
  status           TEXT DEFAULT 'open',
  priority         TEXT DEFAULT 'medium',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id               SERIAL PRIMARY KEY,
  instructor_id    INTEGER NOT NULL REFERENCES users(id),
  topic            TEXT NOT NULL,
  date_scheduled   TIMESTAMP,
  duration         INTEGER,
  location         TEXT,
  max_participants INTEGER DEFAULT 20,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Attendance table
CREATE TABLE IF NOT EXISTS training_attendance (
  id               SERIAL PRIMARY KEY,
  training_id      INTEGER NOT NULL REFERENCES training_sessions(id),
  user_id          INTEGER NOT NULL REFERENCES users(id),
  attended         INTEGER DEFAULT 0,
  completed        INTEGER DEFAULT 0
);

-- Generic Forms table (JSA, LOTO, Injury, Accident, Spill, Inspection)
CREATE TABLE IF NOT EXISTS forms (
  id                       SERIAL PRIMARY KEY,
  user_id                  INTEGER NOT NULL REFERENCES users(id),
  company_id               INTEGER,
  form_type                TEXT NOT NULL,
  form_data                TEXT NOT NULL,
  status                   TEXT DEFAULT 'submitted',
  created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ai_report                TEXT,
  ai_report_generated_at   TIMESTAMP,
  ai_provider              TEXT DEFAULT 'claude',
  sharepoint_url           TEXT,
  sharepoint_item_id       TEXT,
  sharepoint_synced_at     TIMESTAMP,
  is_archived              INTEGER DEFAULT 0,
  archived_at              TIMESTAMP,
  archived_sharepoint_url  TEXT
);

-- Accident Reports table
CREATE TABLE IF NOT EXISTS accident_reports (
  id                   SERIAL PRIMARY KEY,
  user_id              INTEGER NOT NULL REFERENCES users(id),
  accident_date        TIMESTAMP,
  location             TEXT,
  driver_name          TEXT,
  accident_description TEXT,
  status               TEXT DEFAULT 'draft',
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spill Reports table
CREATE TABLE IF NOT EXISTS spill_reports (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  incident_date TIMESTAMP,
  location      TEXT,
  material_name TEXT,
  quantity      TEXT,
  reported_by   TEXT,
  status        TEXT DEFAULT 'draft',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspection Reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  inspection_date DATE,
  inspection_area TEXT,
  inspector_name  TEXT,
  status          TEXT DEFAULT 'draft',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SMART OSHA / NFPA AUDIT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_question_bank (
  id                  SERIAL PRIMARY KEY,
  category            TEXT NOT NULL,
  question            TEXT NOT NULL,
  default_hazard      TEXT,
  default_regulation  TEXT,
  default_severity    TEXT DEFAULT 'Moderate',
  is_active           INTEGER DEFAULT 1,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_forms (
  id                       SERIAL PRIMARY KEY,
  user_id                  INTEGER NOT NULL REFERENCES users(id),
  facility_name            TEXT NOT NULL,
  audit_areas              TEXT NOT NULL,
  audit_category           TEXT NOT NULL,
  audit_date               DATE NOT NULL,
  auditor_name             TEXT NOT NULL,
  status                   TEXT DEFAULT 'submitted',
  ai_report                TEXT,
  ai_report_generated_at   TIMESTAMP,
  document_path            TEXT,
  sharepoint_url           TEXT,
  sharepoint_item_id       TEXT,
  sharepoint_synced_at     TIMESTAMP,
  is_archived              INTEGER DEFAULT 0,
  archived_at              TIMESTAMP,
  archived_sharepoint_url  TEXT,
  created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_findings (
  id                 SERIAL PRIMARY KEY,
  audit_id           INTEGER NOT NULL REFERENCES audit_forms(id) ON DELETE CASCADE,
  finding_number     INTEGER NOT NULL,
  location           TEXT NOT NULL,
  question_id        INTEGER REFERENCES audit_question_bank(id),
  audit_question     TEXT NOT NULL,
  condition_observed TEXT NOT NULL,
  description        TEXT,
  hazard_type        TEXT,
  regulation         TEXT,
  severity           TEXT NOT NULL,
  repeat_finding     TEXT DEFAULT 'Unknown',
  photo_path         TEXT,
  immediate_action   TEXT,
  corrective_action  TEXT,
  responsible_party  TEXT,
  target_date        DATE,
  date_closed        DATE,
  finding_status     TEXT DEFAULT 'Open',
  risk_score         TEXT,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Company Settings (admin-editable, per company)
-- ============================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id                    SERIAL PRIMARY KEY,
  company_id            INTEGER REFERENCES companies(id),
  -- Branding
  company_name          TEXT,
  company_logo_url      TEXT,
  primary_color         TEXT DEFAULT '#0d1f35',
  accent_color          TEXT DEFAULT '#c9943a',
  -- Contact / Footer
  contact_name          TEXT,
  contact_email         TEXT,
  contact_phone         TEXT,
  physical_address      TEXT,
  report_footer         TEXT,
  report_header_note    TEXT,
  -- Operational
  industry              TEXT,
  site_location         TEXT,
  safety_officer        TEXT,
  emergency_number      TEXT,
  -- Timestamps
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by            INTEGER REFERENCES users(id)
);

-- ============================================================
-- SEED: Audit Question Bank
-- ============================================================
INSERT INTO audit_question_bank (id, category, question, default_hazard, default_regulation, default_severity) VALUES
(1,  'Fire Protection / Life Safety', 'Are fire alarm notification devices functional and recently tested?', 'Delayed evacuation', 'OSHA 1910.165 / NFPA 72', 'Critical'),
(2,  'Fire Protection / Life Safety', 'Are fire extinguishers mounted, visible, and inspected monthly?', 'Fire', 'OSHA 1910.157 / NFPA 10', 'High'),
(3,  'Fire Protection / Life Safety', 'Are exit routes clear, illuminated, and marked with proper signage?', 'Egress Obstruction', 'OSHA 1910.37', 'Critical'),
(4,  'Fire Protection / Life Safety', 'Are fire sprinkler heads unobstructed (18-inch clearance)?', 'Fire', 'NFPA 25', 'High'),
(5,  'Fire Protection / Life Safety', 'Are emergency action plan procedures posted and current?', 'Delayed evacuation', 'OSHA 1910.38', 'Moderate'),
(6,  'Walking-Working Surfaces', 'Are walking surfaces free of tripping hazards, holes, and loose material?', 'Slip / Fall', 'OSHA 1910.22', 'High'),
(7,  'Walking-Working Surfaces', 'Are trench and floor grates secured and in good condition?', 'Slip / Fall', 'OSHA 1910.22', 'High'),
(8,  'Walking-Working Surfaces', 'Are stairways equipped with standard railings and handrails?', 'Slip / Fall', 'OSHA 1910.23', 'High'),
(9,  'Walking-Working Surfaces', 'Are elevated platforms and mezzanines guarded with standard railings?', 'Slip / Fall', 'OSHA 1910.29', 'High'),
(10, 'Walking-Working Surfaces', 'Are aisle widths maintained and clearly marked?', 'Egress Obstruction', 'OSHA 1910.22', 'Moderate'),
(11, 'Electrical', 'Are all electrical enclosures closed, labeled, and rated for the environment?', 'Shock / Arc Flash', 'OSHA 1910.303', 'High'),
(12, 'Electrical', 'Are electrical panels free of obstructions (36-inch clearance)?', 'Shock / Arc Flash', 'OSHA 1910.303 / NFPA 70', 'High'),
(13, 'Electrical', 'Are extension cords used only temporarily and in good condition?', 'Shock / Arc Flash', 'OSHA 1910.305', 'Moderate'),
(14, 'Electrical', 'Are GFCIs installed in wet locations and tested regularly?', 'Shock / Arc Flash', 'OSHA 1910.304 / NFPA 70', 'High'),
(15, 'Electrical', 'Are conduit runs intact with no exposed or damaged wiring?', 'Shock / Arc Flash', 'OSHA 1910.305', 'High'),
(16, 'LOTO / Machine Safety', 'Is lockout/tagout performed with individual lock and tag on each energy source?', 'Unexpected energization', 'OSHA 1910.147', 'Critical'),
(17, 'LOTO / Machine Safety', 'Are machine guards in place and functioning on all moving parts?', 'Entanglement', 'OSHA 1910.212', 'Critical'),
(18, 'LOTO / Machine Safety', 'Are LOTO procedures written and posted at each machine?', 'Unexpected energization', 'OSHA 1910.147', 'High'),
(19, 'LOTO / Machine Safety', 'Is annual LOTO inspection/certification documented for each procedure?', 'Unexpected energization', 'OSHA 1910.147', 'High'),
(20, 'Powered Industrial Trucks', 'Are forklift pre-shift inspections documented daily?', 'Entanglement', 'OSHA 1910.178', 'High'),
(21, 'Powered Industrial Trucks', 'Are forklift operators trained and certified (current within 3 years)?', 'Entanglement', 'OSHA 1910.178', 'Critical'),
(22, 'Powered Industrial Trucks', 'Are pedestrian walkways and forklift zones clearly separated and marked?', 'Entanglement', 'OSHA 1910.178', 'High'),
(23, 'Powered Industrial Trucks', 'Are speed limit signs posted in forklift operating areas?', 'Entanglement', 'OSHA 1910.178', 'Moderate'),
(24, 'Compressed Gas / Propane', 'Are propane/compressed gas cylinders secured upright with chain or strap?', 'Explosion', 'OSHA 1910.110 / NFPA 58', 'Critical'),
(25, 'Compressed Gas / Propane', 'Are regulators, hoses, and connections free of leaks and damage?', 'Explosion', 'OSHA 1910.110', 'Critical'),
(26, 'Compressed Gas / Propane', 'Are cylinder storage areas ventilated and posted with no-smoking signs?', 'Explosion', 'OSHA 1910.110 / NFPA 58', 'High'),
(27, 'Compressed Gas / Propane', 'Are empty cylinders segregated and marked from full cylinders?', 'Explosion', 'OSHA 1910.101', 'Moderate'),
(28, 'Chemical / Flammable Storage', 'Are all chemical containers properly labeled with GHS labels?', 'Toxic Exposure', 'OSHA 1910.1200', 'High'),
(29, 'Chemical / Flammable Storage', 'Are Safety Data Sheets (SDS) accessible for all hazardous chemicals?', 'Toxic Exposure', 'OSHA 1910.1200', 'High'),
(30, 'Chemical / Flammable Storage', 'Is secondary containment provided for liquid chemicals?', 'Environmental', 'OSHA 1910.106 / EPA', 'High'),
(31, 'Chemical / Flammable Storage', 'Are flammables stored in approved flammable storage cabinets?', 'Fire', 'OSHA 1910.106 / NFPA 30', 'High'),
(32, 'Welding / Hot Work', 'Is a hot work permit issued before any welding or cutting operations?', 'Fire', 'NFPA 51B / OSHA 1910.252', 'Critical'),
(33, 'Welding / Hot Work', 'Are fire watch duties assigned and maintained after hot work?', 'Fire', 'NFPA 51B', 'High'),
(34, 'Welding / Hot Work', 'Are welding screens/curtains used to protect nearby workers?', 'Shock / Arc Flash', 'OSHA 1910.252', 'High'),
(35, 'Welding / Hot Work', 'Is proper PPE (face shield, gloves, leather jacket) available and used?', 'Shock / Arc Flash', 'OSHA 1910.252', 'High'),
(36, 'Dock / Hydraulic Systems', 'Are dock leveler hydraulic systems free of leaks and corrosion?', 'Structural', 'OSHA 1910.178', 'High'),
(37, 'Dock / Hydraulic Systems', 'Are dock locks or wheel chocks used when trailers are being loaded?', 'Entanglement', 'OSHA 1910.178', 'Critical'),
(38, 'Dock / Hydraulic Systems', 'Are dock bumpers in good condition to protect building and trailers?', 'Structural', 'OSHA 1910.178', 'Moderate'),
(39, 'Dock / Hydraulic Systems', 'Are dock area floors free of debris and slip hazards?', 'Slip / Fall', 'OSHA 1910.22', 'High'),
(40, 'Emergency Equipment', 'Are eyewash stations accessible, functional, and flushed weekly?', 'Toxic Exposure', 'OSHA 1910.151 / ANSI Z358.1', 'Critical'),
(41, 'Emergency Equipment', 'Are first aid kits fully stocked and inspected monthly?', 'Toxic Exposure', 'OSHA 1910.151', 'High'),
(42, 'Emergency Equipment', 'Are AEDs accessible and inspected per manufacturer schedule?', 'Other', 'OSHA 1910.151', 'High'),
(43, 'Emergency Equipment', 'Are emergency contact numbers posted at phones and entry points?', 'Delayed evacuation', 'OSHA 1910.38', 'Moderate'),
(44, 'Emergency Equipment', 'Is emergency lighting tested monthly and functional?', 'Egress Obstruction', 'OSHA 1910.37 / NFPA 101', 'High')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences after seeding with explicit IDs
SELECT setval('audit_question_bank_id_seq', 44);
