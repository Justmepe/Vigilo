-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  job_title TEXT,
  facility TEXT,
  department TEXT,
  role TEXT DEFAULT 'User',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- JSA Forms table
CREATE TABLE IF NOT EXISTS jsa_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  department TEXT NOT NULL,
  job_description TEXT,
  location TEXT,
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'draft',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- LOTO Assessments table
CREATE TABLE IF NOT EXISTS loto_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  facility TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'draft',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Injury Reports table
CREATE TABLE IF NOT EXISTS injury_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  date_of_injury DATETIME,
  description TEXT,
  severity TEXT,
  status TEXT DEFAULT 'draft',
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Action Items table
CREATE TABLE IF NOT EXISTS action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  assigned_to INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Training Sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instructor_id INTEGER NOT NULL,
  topic TEXT NOT NULL,
  date_scheduled DATETIME,
  duration INTEGER,
  location TEXT,
  max_participants INTEGER DEFAULT 20,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Training Attendance table
CREATE TABLE IF NOT EXISTS training_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  attended INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (training_id) REFERENCES training_sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Generic Forms table (for JSA, LOTO, Injury, Accident, Spill, Inspection)
CREATE TABLE IF NOT EXISTS forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  form_type TEXT NOT NULL,
  form_data TEXT NOT NULL,
  status TEXT DEFAULT 'submitted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ai_report TEXT,
  ai_report_generated_at DATETIME,
  ai_provider TEXT DEFAULT 'claude',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Accident Reports table
CREATE TABLE IF NOT EXISTS accident_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  accident_date DATETIME,
  location TEXT,
  driver_name TEXT,
  accident_description TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Spill Reports table
CREATE TABLE IF NOT EXISTS spill_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  incident_date DATETIME,
  location TEXT,
  material_name TEXT,
  quantity TEXT,
  reported_by TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inspection Reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  inspection_date DATE,
  inspection_area TEXT,
  inspector_name TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- SMART OSHA / NFPA AUDIT TABLES
-- ============================================================

-- Master Question Bank (admin-editable)
CREATE TABLE IF NOT EXISTS audit_question_bank (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  default_hazard TEXT,
  default_regulation TEXT,
  default_severity TEXT DEFAULT 'Moderate',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit Form Sessions (one per audit)
CREATE TABLE IF NOT EXISTS audit_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  facility_name TEXT NOT NULL,
  audit_areas TEXT NOT NULL,       -- JSON array of selected areas
  audit_category TEXT NOT NULL,
  audit_date DATE NOT NULL,
  auditor_name TEXT NOT NULL,
  status TEXT DEFAULT 'submitted', -- submitted, closed
  ai_report TEXT,
  ai_report_generated_at DATETIME,
  document_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit Findings (one record per observation)
CREATE TABLE IF NOT EXISTS audit_findings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER NOT NULL,
  finding_number INTEGER NOT NULL,
  location TEXT NOT NULL,
  question_id INTEGER,
  audit_question TEXT NOT NULL,
  condition_observed TEXT NOT NULL, -- Compliant | Non-Compliant | Improvement Opportunity | Not Applicable
  description TEXT,
  hazard_type TEXT,
  regulation TEXT,
  severity TEXT NOT NULL,           -- Critical | High | Moderate | Low | Other
  repeat_finding TEXT DEFAULT 'Unknown', -- Yes | No | Unknown
  photo_path TEXT,
  immediate_action TEXT,
  corrective_action TEXT,
  responsible_party TEXT,
  target_date DATE,
  date_closed DATE,
  finding_status TEXT DEFAULT 'Open', -- Open | In Progress | Closed
  risk_score TEXT,                  -- auto-calculated: Critical | High | Moderate | Low
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES audit_forms(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES audit_question_bank(id)
);

-- ============================================================
-- SEED: Master Question Bank
-- ============================================================
INSERT OR IGNORE INTO audit_question_bank (id, category, question, default_hazard, default_regulation, default_severity) VALUES
-- Fire Protection / Life Safety
(1,  'Fire Protection / Life Safety', 'Are fire alarm notification devices functional and recently tested?', 'Delayed evacuation', 'OSHA 1910.165 / NFPA 72', 'Critical'),
(2,  'Fire Protection / Life Safety', 'Are fire extinguishers mounted, visible, and inspected monthly?', 'Fire', 'OSHA 1910.157 / NFPA 10', 'High'),
(3,  'Fire Protection / Life Safety', 'Are exit routes clear, illuminated, and marked with proper signage?', 'Egress Obstruction', 'OSHA 1910.37', 'Critical'),
(4,  'Fire Protection / Life Safety', 'Are fire sprinkler heads unobstructed (18-inch clearance)?', 'Fire', 'NFPA 25', 'High'),
(5,  'Fire Protection / Life Safety', 'Are emergency action plan procedures posted and current?', 'Delayed evacuation', 'OSHA 1910.38', 'Moderate'),
-- Walking-Working Surfaces
(6,  'Walking-Working Surfaces', 'Are walking surfaces free of tripping hazards, holes, and loose material?', 'Slip / Fall', 'OSHA 1910.22', 'High'),
(7,  'Walking-Working Surfaces', 'Are trench and floor grates secured and in good condition?', 'Slip / Fall', 'OSHA 1910.22', 'High'),
(8,  'Walking-Working Surfaces', 'Are stairways equipped with standard railings and handrails?', 'Slip / Fall', 'OSHA 1910.23', 'High'),
(9,  'Walking-Working Surfaces', 'Are elevated platforms and mezzanines guarded with standard railings?', 'Slip / Fall', 'OSHA 1910.29', 'High'),
(10, 'Walking-Working Surfaces', 'Are aisle widths maintained and clearly marked?', 'Egress Obstruction', 'OSHA 1910.22', 'Moderate'),
-- Electrical
(11, 'Electrical', 'Are all electrical enclosures closed, labeled, and rated for the environment?', 'Shock / Arc Flash', 'OSHA 1910.303', 'High'),
(12, 'Electrical', 'Are electrical panels free of obstructions (36-inch clearance)?', 'Shock / Arc Flash', 'OSHA 1910.303 / NFPA 70', 'High'),
(13, 'Electrical', 'Are extension cords used only temporarily and in good condition?', 'Shock / Arc Flash', 'OSHA 1910.305', 'Moderate'),
(14, 'Electrical', 'Are GFCIs installed in wet locations and tested regularly?', 'Shock / Arc Flash', 'OSHA 1910.304 / NFPA 70', 'High'),
(15, 'Electrical', 'Are conduit runs intact with no exposed or damaged wiring?', 'Shock / Arc Flash', 'OSHA 1910.305', 'High'),
-- LOTO / Machine Safety
(16, 'LOTO / Machine Safety', 'Is lockout/tagout performed with individual lock and tag on each energy source?', 'Unexpected energization', 'OSHA 1910.147', 'Critical'),
(17, 'LOTO / Machine Safety', 'Are machine guards in place and functioning on all moving parts?', 'Entanglement', 'OSHA 1910.212', 'Critical'),
(18, 'LOTO / Machine Safety', 'Are LOTO procedures written and posted at each machine?', 'Unexpected energization', 'OSHA 1910.147', 'High'),
(19, 'LOTO / Machine Safety', 'Is annual LOTO inspection/certification documented for each procedure?', 'Unexpected energization', 'OSHA 1910.147', 'High'),
-- Powered Industrial Trucks
(20, 'Powered Industrial Trucks', 'Are forklift pre-shift inspections documented daily?', 'Entanglement', 'OSHA 1910.178', 'High'),
(21, 'Powered Industrial Trucks', 'Are forklift operators trained and certified (current within 3 years)?', 'Entanglement', 'OSHA 1910.178', 'Critical'),
(22, 'Powered Industrial Trucks', 'Are pedestrian walkways and forklift zones clearly separated and marked?', 'Entanglement', 'OSHA 1910.178', 'High'),
(23, 'Powered Industrial Trucks', 'Are speed limit signs posted in forklift operating areas?', 'Entanglement', 'OSHA 1910.178', 'Moderate'),
-- Compressed Gas / Propane
(24, 'Compressed Gas / Propane', 'Are propane/compressed gas cylinders secured upright with chain or strap?', 'Explosion', 'OSHA 1910.110 / NFPA 58', 'Critical'),
(25, 'Compressed Gas / Propane', 'Are regulators, hoses, and connections free of leaks and damage?', 'Explosion', 'OSHA 1910.110', 'Critical'),
(26, 'Compressed Gas / Propane', 'Are cylinder storage areas ventilated and posted with no-smoking signs?', 'Explosion', 'OSHA 1910.110 / NFPA 58', 'High'),
(27, 'Compressed Gas / Propane', 'Are empty cylinders segregated and marked from full cylinders?', 'Explosion', 'OSHA 1910.101', 'Moderate'),
-- Chemical / Flammable Storage
(28, 'Chemical / Flammable Storage', 'Are all chemical containers properly labeled with GHS labels?', 'Toxic Exposure', 'OSHA 1910.1200', 'High'),
(29, 'Chemical / Flammable Storage', 'Are Safety Data Sheets (SDS) accessible for all hazardous chemicals?', 'Toxic Exposure', 'OSHA 1910.1200', 'High'),
(30, 'Chemical / Flammable Storage', 'Is secondary containment provided for liquid chemicals?', 'Environmental', 'OSHA 1910.106 / EPA', 'High'),
(31, 'Chemical / Flammable Storage', 'Are flammables stored in approved flammable storage cabinets?', 'Fire', 'OSHA 1910.106 / NFPA 30', 'High'),
-- Welding / Hot Work
(32, 'Welding / Hot Work', 'Is a hot work permit issued before any welding or cutting operations?', 'Fire', 'NFPA 51B / OSHA 1910.252', 'Critical'),
(33, 'Welding / Hot Work', 'Are fire watch duties assigned and maintained after hot work?', 'Fire', 'NFPA 51B', 'High'),
(34, 'Welding / Hot Work', 'Are welding screens/curtains used to protect nearby workers?', 'Shock / Arc Flash', 'OSHA 1910.252', 'High'),
(35, 'Welding / Hot Work', 'Is proper PPE (face shield, gloves, leather jacket) available and used?', 'Shock / Arc Flash', 'OSHA 1910.252', 'High'),
-- Dock / Hydraulic Systems
(36, 'Dock / Hydraulic Systems', 'Are dock leveler hydraulic systems free of leaks and corrosion?', 'Structural', 'OSHA 1910.178', 'High'),
(37, 'Dock / Hydraulic Systems', 'Are dock locks or wheel chocks used when trailers are being loaded?', 'Entanglement', 'OSHA 1910.178', 'Critical'),
(38, 'Dock / Hydraulic Systems', 'Are dock bumpers in good condition to protect building and trailers?', 'Structural', 'OSHA 1910.178', 'Moderate'),
(39, 'Dock / Hydraulic Systems', 'Are dock area floors free of debris and slip hazards?', 'Slip / Fall', 'OSHA 1910.22', 'High'),
-- Emergency Equipment
(40, 'Emergency Equipment', 'Are eyewash stations accessible, functional, and flushed weekly?', 'Toxic Exposure', 'OSHA 1910.151 / ANSI Z358.1', 'Critical'),
(41, 'Emergency Equipment', 'Are first aid kits fully stocked and inspected monthly?', 'Toxic Exposure', 'OSHA 1910.151', 'High'),
(42, 'Emergency Equipment', 'Are AEDs accessible and inspected per manufacturer schedule?', 'Other', 'OSHA 1910.151', 'High'),
(43, 'Emergency Equipment', 'Are emergency contact numbers posted at phones and entry points?', 'Delayed evacuation', 'OSHA 1910.38', 'Moderate'),
(44, 'Emergency Equipment', 'Is emergency lighting tested monthly and functional?', 'Egress Obstruction', 'OSHA 1910.37 / NFPA 101', 'High');

-- Insert default admin user (password: Admin123!)
INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name, job_title, facility, department, role, is_active)
VALUES (1, 'admin', 'admin@silverbaycatering.com', '$2b$10$BsQcPTcfF0T2FLB0S0M8M.2j8KvKL8KwKUqsEfTRvZ0K6VQQy8lPu', 'Administrator', 'Safety Manager', 'Ketchikan', 'Safety', 'Admin', 1);
