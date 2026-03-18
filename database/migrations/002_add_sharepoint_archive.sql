-- Migration 002: Add SharePoint sync + archive fields
-- Run once against safety_manager.db

-- Add SharePoint + archive columns to forms table
ALTER TABLE forms ADD COLUMN sharepoint_file_id TEXT;
ALTER TABLE forms ADD COLUMN sharepoint_url TEXT;
ALTER TABLE forms ADD COLUMN sharepoint_synced_at DATETIME;
ALTER TABLE forms ADD COLUMN sharepoint_status TEXT DEFAULT 'pending';
ALTER TABLE forms ADD COLUMN archived_at DATETIME;
ALTER TABLE forms ADD COLUMN archived_by INTEGER REFERENCES users(id);

-- Add SharePoint + archive columns to audit_forms table
ALTER TABLE audit_forms ADD COLUMN sharepoint_file_id TEXT;
ALTER TABLE audit_forms ADD COLUMN sharepoint_url TEXT;
ALTER TABLE audit_forms ADD COLUMN sharepoint_synced_at DATETIME;
ALTER TABLE audit_forms ADD COLUMN sharepoint_status TEXT DEFAULT 'pending';
ALTER TABLE audit_forms ADD COLUMN archived_at DATETIME;
ALTER TABLE audit_forms ADD COLUMN archived_by INTEGER REFERENCES users(id);
