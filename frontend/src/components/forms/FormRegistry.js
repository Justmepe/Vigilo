/**
 * Form Registry
 * Central registry for all form components
 * Import this to dynamically load forms without modifying main app
 */

import { Shield, AlertTriangle, Lock, CheckCircle, Droplet, ClipboardCheck } from 'lucide-react';
import JSAForm from './JSAFormEnhanced'; // Enhanced JSA form
import LOTOFormEnhanced from './LOTOFormEnhanced'; // Enhanced LOTO form for seafood processing
import InjuryReportForm from './InjuryReportForm';
import AccidentReportForm from './AccidentReportForm';
import SpillReleaseForm from './SpillReleaseForm';
import InspectionForm from './InspectionForm';
import AuditForm from './AuditForm';

/**
 * Form Registry Configuration
 * Each form must have:
 * - id: unique identifier (used in API calls)
 * - name: display name
 * - icon: Lucide icon component
 * - component: React component
 * - description: short description
 * - sections: number of sections (for preview)
 */
export const FORM_REGISTRY = {
  jsa: {
    id: 'jsa',
    name: 'Job Safety Analysis (JSA)',
    icon: Shield,
    component: JSAForm,
    description: 'Professional JHA/JSA with step-by-step hazard analysis and controls',
    sections: 4,
    category: 'Safety Analysis'
  },

  loto: {
    id: 'loto',
    name: 'Lockout/Tagout (LOTO)',
    icon: Lock,
    component: LOTOFormEnhanced,
    description: 'Comprehensive OSHA-compliant LOTO form for seafood processing facilities',
    sections: 25,
    category: 'Safety Procedures',
    enhanced: true,
    features: [
      'OSHA 29 CFR 1910.147 Compliant',
      'Try-out verification required',
      'Zero energy state measurements',
      'Seafood industry-specific hazards',
      'Food safety integration',
      'Group lockout provisions',
      'Pre-restoration checklist'
    ]
  },

  injury: {
    id: 'injury',
    name: 'Employee Injury & Illness Report',
    icon: AlertTriangle,
    component: InjuryReportForm,
    description: 'Report workplace injuries and incidents',
    sections: 5,
    category: 'Incident Reporting'
  },

  accident: {
    id: 'accident',
    name: 'Accident Report',
    icon: AlertTriangle,
    component: AccidentReportForm,
    description: 'Document workplace accidents',
    sections: 4,
    category: 'Incident Reporting'
  },

  spillReport: {
    id: 'spillReport',
    name: 'Emergency Spill/Release Report',
    icon: Droplet,
    component: SpillReleaseForm,
    description: 'Report chemical spills and releases',
    sections: 3,
    category: 'Environmental'
  },

  monthlyInspection: {
    id: 'monthlyInspection',
    name: 'Monthly Hygiene Inspection',
    icon: CheckCircle,
    component: InspectionForm,
    description: 'Conduct routine facility inspections',
    sections: 4,
    category: 'Compliance'
  },

  oshaAudit: {
    id: 'oshaAudit',
    name: 'SMART OSHA / NFPA Audit',
    icon: ClipboardCheck,
    component: AuditForm,
    description: 'Dynamic OSHA & NFPA compliance audit with AI-generated Word report, risk scoring, and corrective action tracking',
    sections: 2,
    category: 'Compliance',
    enhanced: true,
    features: [
      'Dynamic question bank (44 OSHA/NFPA questions)',
      'Auto-populates regulation & hazard type',
      'Auto risk scoring (Severity + Repeat)',
      'Repeat finding escalation alerts',
      'AI-generated executive summary (Claude)',
      'Exports professional Word (.docx) report',
      'Corrective action tracking with due dates',
    ]
  }
};

/**
 * Get form configuration by ID
 */
export const getFormConfig = (formId) => {
  return FORM_REGISTRY[formId] || null;
};

/**
 * Get all forms grouped by category
 */
export const getFormsByCategory = () => {
  const grouped = {};

  Object.values(FORM_REGISTRY).forEach(form => {
    const category = form.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(form);
  });

  return grouped;
};

/**
 * Get all form IDs
 */
export const getAllFormIds = () => {
  return Object.keys(FORM_REGISTRY);
};

/**
 * Get form component by ID
 */
export const getFormComponent = (formId) => {
  const config = getFormConfig(formId);
  return config ? config.component : null;
};

/**
 * Check if form exists
 */
export const formExists = (formId) => {
  return formId in FORM_REGISTRY;
};

export default FORM_REGISTRY;
