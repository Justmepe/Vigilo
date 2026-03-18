/* eslint-disable react/function-component-definition */
/**
 * SMART OSHA / NFPA Audit Form
 * Sections:
 *   1 — Audit Setup (header fields)
 *   2 — Dynamic Finding Entry (per observation)
 */

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, Plus, Trash2, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Download, Loader, RefreshCw, Info,
} from 'lucide-react';
import apiClient from '../../services/api/client';
import { getFacilityOptions, getFacilityLabel } from '../../constants/facilities';

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCATION_OPTIONS = [
  'Production Floor', 'Mezzanine', 'Dock', 'Electrical Room',
  'Welding Area', 'Chemical Storage', 'Forklift Area',
  'Boiler Room', 'Roof / Mechanical', 'Break Room', 'Parking Lot', 'Other',
];

const AUDIT_CATEGORIES = [
  'Fire Protection / Life Safety',
  'Walking-Working Surfaces',
  'Electrical',
  'LOTO / Machine Safety',
  'Powered Industrial Trucks',
  'Compressed Gas / Propane',
  'Chemical / Flammable Storage',
  'Welding / Hot Work',
  'Dock / Hydraulic Systems',
  'Emergency Equipment',
];

const CONDITIONS = ['Compliant', 'Non-Compliant', 'Improvement Opportunity', 'Not Applicable'];

const HAZARD_TYPES = [
  'Slip / Fall', 'Fire', 'Explosion', 'Shock / Arc Flash', 'Toxic Exposure',
  'Entanglement', 'Egress Obstruction', 'Environmental', 'Structural',
  'Delayed evacuation', 'Unexpected energization', 'Other',
];

const SEVERITIES = ['Critical', 'High', 'Moderate', 'Low', 'Other'];

const REPEAT_OPTIONS = ['Yes', 'No', 'Unknown'];

const FINDING_STATUSES = ['Open', 'In Progress', 'Closed'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcRiskScore(severity, repeatFinding, conditionObserved) {
  if (conditionObserved === 'Compliant' || conditionObserved === 'Not Applicable') return 'N/A';
  const map = { Critical: 4, High: 3, Moderate: 2, Low: 1, Other: 1 };
  let score = map[severity] || 2;
  if (repeatFinding === 'Yes') score += 1;
  if (score >= 5) return 'Critical';
  if (score >= 4) return 'High';
  if (score >= 3) return 'Moderate';
  return 'Low';
}

function riskBadgeClass(score) {
  const map = {
    Critical: 'bg-red-100 text-red-800 border border-red-300',
    High:     'bg-orange-100 text-orange-800 border border-orange-300',
    Moderate: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    Low:      'bg-green-100 text-green-800 border border-green-300',
    'N/A':    'bg-gray-100 text-gray-600 border border-gray-200',
  };
  return map[score] || map['N/A'];
}

function conditionClass(cond) {
  const map = {
    'Compliant':              'bg-green-100 text-green-800',
    'Non-Compliant':          'bg-red-100 text-red-800',
    'Improvement Opportunity':'bg-yellow-100 text-yellow-800',
    'Not Applicable':         'bg-gray-100 text-gray-600',
  };
  return map[cond] || 'bg-gray-100 text-gray-600';
}

const emptyFinding = () => ({
  _id: Date.now() + Math.random(),
  location: '',
  question_id: '',
  audit_question: '',
  condition_observed: 'Compliant',
  description: '',
  hazard_type: '',
  regulation: '',
  severity: 'Moderate',
  repeat_finding: 'Unknown',
  photo_path: '',
  immediate_action: '',
  corrective_action: '',
  responsible_party: '',
  target_date: '',
  finding_status: 'Open',
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ num, title, subtitle }) {
  return (
    <div className="bg-blue-800 text-white px-4 py-3 rounded-t-lg">
      <div className="flex items-center gap-2">
        <span className="bg-white text-blue-800 font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full">{num}</span>
        <h2 className="font-bold text-base">{title}</h2>
      </div>
      {subtitle && <p className="text-blue-200 text-xs mt-0.5 ml-8">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function Select({ value, onChange, options, placeholder, className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
    />
  );
}

// ─── Finding Card ─────────────────────────────────────────────────────────────

function FindingCard({ finding, index, questionBank, categoryFilter, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const filteredQuestions = categoryFilter
    ? questionBank.filter(q => q.category === categoryFilter)
    : questionBank;

  const riskScore = calcRiskScore(finding.severity, finding.repeat_finding, finding.condition_observed);
  const isRepeat = finding.repeat_finding === 'Yes';
  const isNonCompliant = finding.condition_observed === 'Non-Compliant';

  function handleQuestionSelect(qId) {
    const q = questionBank.find(x => String(x.id) === String(qId));
    if (!q) {
      onUpdate({ question_id: '', audit_question: '' });
      return;
    }
    onUpdate({
      question_id:    q.id,
      audit_question: q.question,
      hazard_type:    finding.hazard_type  || q.default_hazard     || '',
      regulation:     finding.regulation   || q.default_regulation || '',
      severity:       finding.severity !== 'Moderate' ? finding.severity : (q.default_severity || 'Moderate'),
    });
  }

  return (
    <div className={`border rounded-lg overflow-hidden mb-3 ${isRepeat ? 'border-red-400' : 'border-gray-200'}`}>
      {/* Card header — split into toggle area + remove button to avoid nested <button> */}
      <div className={`flex items-center justify-between px-3 py-2 ${isRepeat ? 'bg-red-50' : 'bg-gray-50'}`}>
        {/* Left: click to expand/collapse */}
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => setExpanded(v => !v)}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setExpanded(v => !v)}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
        >
          <span className="bg-blue-800 text-white text-xs font-bold px-2 py-0.5 rounded">#{index + 1}</span>
          {isRepeat && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle size={10} /> REPEAT
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${conditionClass(finding.condition_observed)}`}>
            {finding.condition_observed}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${riskBadgeClass(riskScore)}`}>
            Risk: {riskScore}
          </span>
          {finding.location && (
            <span className="text-xs text-gray-600 truncate max-w-32">{finding.location}</span>
          )}
        </div>
        {/* Right: actions */}
        <div className="flex items-center gap-2 ml-2">
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-600 p-1"
            title="Remove finding"
          >
            <Trash2 size={14} />
          </button>
          <button type="button" onClick={() => setExpanded(v => !v)} className="p-1 text-gray-400">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Card body */}
      {expanded && (
        <div className="p-3 grid grid-cols-1 gap-3">
          {/* Row 1: Location + Question */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Location</FieldLabel>
              <Select
                value={finding.location}
                onChange={v => onUpdate({ location: v })}
                options={LOCATION_OPTIONS}
                placeholder="Select location…"
              />
            </div>
            <div>
              <FieldLabel required>Audit Question</FieldLabel>
              <Select
                value={finding.question_id}
                onChange={handleQuestionSelect}
                options={filteredQuestions.map(q => ({ value: q.id, label: q.question.length > 65 ? q.question.slice(0, 65) + '…' : q.question }))}
                placeholder="Select from question bank…"
              />
              {/* Free-text override */}
              <input
                type="text"
                value={finding.audit_question}
                onChange={e => onUpdate({ audit_question: e.target.value, question_id: '' })}
                placeholder="Or type custom question…"
                className="w-full mt-1 border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Row 2: Condition + Hazard + Severity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <FieldLabel required>Condition Observed</FieldLabel>
              <Select
                value={finding.condition_observed}
                onChange={v => onUpdate({ condition_observed: v })}
                options={CONDITIONS}
              />
            </div>
            <div>
              <FieldLabel>Hazard Type</FieldLabel>
              <Select
                value={finding.hazard_type}
                onChange={v => onUpdate({ hazard_type: v })}
                options={HAZARD_TYPES}
                placeholder="Select hazard…"
              />
            </div>
            <div>
              <FieldLabel required>Severity</FieldLabel>
              <Select
                value={finding.severity}
                onChange={v => onUpdate({ severity: v })}
                options={SEVERITIES}
              />
            </div>
          </div>

          {/* Row 3: Regulation + Repeat + Risk Score */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FieldLabel>Regulation (OSHA / NFPA)</FieldLabel>
              <input
                type="text"
                value={finding.regulation}
                onChange={e => onUpdate({ regulation: e.target.value })}
                placeholder="e.g. OSHA 1910.147 / NFPA 72 — auto-filled from question bank"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <FieldLabel required>Repeat Finding?</FieldLabel>
              <Select
                value={finding.repeat_finding}
                onChange={v => onUpdate({ repeat_finding: v })}
                options={REPEAT_OPTIONS}
              />
              {isRepeat && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> Escalation required
                </p>
              )}
            </div>
          </div>

          {/* Computed Risk Score display */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Auto Risk Score:</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${riskBadgeClass(riskScore)}`}>{riskScore}</span>
            {riskScore === 'Critical' && <span className="text-red-600 text-xs">⚠ Immediate action required</span>}
          </div>

          {/* Description — required if Non-Compliant */}
          {(isNonCompliant || finding.description) && (
            <div>
              <FieldLabel required={isNonCompliant}>Description of Finding</FieldLabel>
              <TextArea
                value={finding.description}
                onChange={v => onUpdate({ description: v })}
                placeholder="Describe the specific condition observed…"
                rows={2}
              />
            </div>
          )}

          {/* Actions row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Immediate Action Taken</FieldLabel>
              <TextArea
                value={finding.immediate_action}
                onChange={v => onUpdate({ immediate_action: v })}
                placeholder="Action taken on the spot…"
                rows={2}
              />
            </div>
            <div>
              <FieldLabel>Corrective Action Required</FieldLabel>
              <TextArea
                value={finding.corrective_action}
                onChange={v => onUpdate({ corrective_action: v })}
                placeholder="Long-term corrective action needed…"
                rows={2}
              />
            </div>
          </div>

          {/* Tracking row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <FieldLabel>Responsible Party</FieldLabel>
              <input
                type="text"
                value={finding.responsible_party}
                onChange={e => onUpdate({ responsible_party: e.target.value })}
                placeholder="Name or department…"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <FieldLabel>Target Completion Date</FieldLabel>
              <input
                type="date"
                value={finding.target_date}
                onChange={e => onUpdate({ target_date: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <FieldLabel>Finding Status</FieldLabel>
              <Select
                value={finding.finding_status}
                onChange={v => onUpdate({ finding_status: v })}
                options={FINDING_STATUSES}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

function SummaryBar({ findings }) {
  const counts = {
    total:       findings.length,
    nonCompliant: findings.filter(f => f.condition_observed === 'Non-Compliant').length,
    critical:    findings.filter(f => f.severity === 'Critical').length,
    repeats:     findings.filter(f => f.repeat_finding === 'Yes').length,
  };
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label: 'Total', value: counts.total,       color: 'bg-blue-50  text-blue-800  border-blue-200'  },
        { label: 'Non-Compliant', value: counts.nonCompliant, color: 'bg-red-50   text-red-800   border-red-200'   },
        { label: 'Critical',      value: counts.critical,     color: 'bg-orange-50 text-orange-800 border-orange-200' },
        { label: 'Repeat',        value: counts.repeats,      color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
      ].map(s => (
        <div key={s.label} className={`border rounded p-2 text-center ${s.color}`}>
          <div className="text-xl font-bold">{s.value}</div>
          <div className="text-xs font-medium">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export default function AuditForm({ onSuccess, onCancel }) {
  const [questionBank, setQuestionBank]   = useState([]);
  const [loadingQB,    setLoadingQB]      = useState(true);
  const [submitting,   setSubmitting]     = useState(false);
  const [downloading,  setDownloading]    = useState(false);
  const [submitError,  setSubmitError]    = useState('');
  const [submitSuccess,setSubmitSuccess]  = useState(null); // { auditId }
  const [findings, setFindings]           = useState([emptyFinding()]);

  // Section 1 setup
  const [setup, setSetup] = useState({
    facility_name:   '',
    audit_areas:     [],
    audit_category:  '',
    audit_date:      new Date().toISOString().split('T')[0],
    auditor_name:    '',
  });

  // Load question bank on mount
  useEffect(() => {
    apiClient.get('/audit/questions')
      .then(res => setQuestionBank(res.data?.data || []))
      .catch(() => setQuestionBank([]))
      .finally(() => setLoadingQB(false));
  }, []);

  // ── Setup field helpers
  function setSetupField(field, value) {
    setSetup(prev => ({ ...prev, [field]: value }));
  }

  function toggleArea(area) {
    setSetup(prev => ({
      ...prev,
      audit_areas: prev.audit_areas.includes(area)
        ? prev.audit_areas.filter(a => a !== area)
        : [...prev.audit_areas, area],
    }));
  }

  // ── Finding helpers
  function addFinding() {
    setFindings(prev => [...prev, emptyFinding()]);
  }

  function removeFinding(idx) {
    setFindings(prev => prev.filter((_, i) => i !== idx));
  }

  function updateFinding(idx, changes) {
    setFindings(prev => prev.map((f, i) => i === idx ? { ...f, ...changes } : f));
  }

  // ── Validation
  function validate() {
    if (!setup.facility_name.trim()) return 'Facility name is required.';
    if (!setup.audit_category)       return 'Audit category is required.';
    if (!setup.audit_date)           return 'Audit date is required.';
    if (!setup.auditor_name.trim())  return 'Auditor name is required.';
    if (findings.length === 0)       return 'At least one finding is required.';
    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];
      if (!f.location) return `Finding #${i + 1}: Location is required.`;
      if (!f.audit_question.trim()) return `Finding #${i + 1}: Audit question is required.`;
      if (!f.severity)  return `Finding #${i + 1}: Severity is required.`;
      if (f.condition_observed === 'Non-Compliant' && !f.description.trim())
        return `Finding #${i + 1}: Description is required for Non-Compliant findings.`;
    }
    return null;
  }

  // ── Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');

    const err = validate();
    if (err) { setSubmitError(err); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...setup,
        facility_name: getFacilityLabel(setup.facility_name),
        findings: findings.map(f => ({
          location:          f.location,
          question_id:       f.question_id || null,
          audit_question:    f.audit_question,
          condition_observed:f.condition_observed,
          description:       f.description,
          hazard_type:       f.hazard_type,
          regulation:        f.regulation,
          severity:          f.severity,
          repeat_finding:    f.repeat_finding,
          photo_path:        f.photo_path,
          immediate_action:  f.immediate_action,
          corrective_action: f.corrective_action,
          responsible_party: f.responsible_party,
          target_date:       f.target_date,
          finding_status:    f.finding_status,
        })),
      };

      const res = await apiClient.post('/audit', payload);
      setSubmitSuccess({ auditId: res.data.data.id });
      if (onSuccess) onSuccess(res.data.data);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit audit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Download DOCX
  async function handleDownload() {
    if (!submitSuccess) return;
    setDownloading(true);
    try {
      const res = await apiClient.get(`/audit/${submitSuccess.auditId}/export-docx`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `OSHA_Audit_${setup.facility_name.replace(/\s+/g, '_')}_${setup.audit_date}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setSubmitError('Download failed. Try again in a moment.');
    } finally {
      setDownloading(false);
    }
  }

  // ─── Render: Success state ─────────────────────────────────────────────────
  if (submitSuccess) {
    const nonCompliant = findings.filter(f => f.condition_observed === 'Non-Compliant').length;
    const critical     = findings.filter(f => f.severity === 'Critical').length;
    const repeats      = findings.filter(f => f.repeat_finding === 'Yes').length;

    return (
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Audit Submitted</h2>
          <p className="text-green-700 mb-1">Audit ID: <strong>AUD-{String(submitSuccess.auditId).padStart(4, '0')}</strong></p>
          <p className="text-sm text-green-600 mb-6">AI executive summary is being generated in the background.</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-green-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{findings.length}</div>
              <div className="text-xs text-gray-500">Total Findings</div>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-700">{nonCompliant}</div>
              <div className="text-xs text-gray-500">Non-Compliant</div>
            </div>
            <div className="bg-white border border-orange-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-700">{critical}</div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
          </div>

          {repeats > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <p className="text-red-700 text-sm font-medium">
                {repeats} repeat finding{repeats > 1 ? 's' : ''} detected — leadership notification required.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-blue-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-60"
            >
              {downloading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? 'Generating…' : 'Download Word Report (.docx)'}
            </button>
            <button
              onClick={() => { setSubmitSuccess(null); setFindings([emptyFinding()]); setSetup({ facility_name: '', audit_areas: [], audit_category: '', audit_date: new Date().toISOString().split('T')[0], auditor_name: '' }); setSubmitError(''); }}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50"
            >
              <RefreshCw size={16} /> New Audit
            </button>
          </div>

          {submitError && <p className="text-red-600 text-sm mt-3">{submitError}</p>}
        </div>
      </div>
    );
  }

  // ─── Render: Form ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-800 p-2 rounded-lg">
          <ClipboardCheck size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">SMART OSHA / NFPA Safety Audit</h1>
          <p className="text-xs text-gray-500">Designed for any facility / any location</p>
        </div>
      </div>

      {/* ── SECTION 1: Audit Setup ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
        <SectionHeader num="1" title="Audit Setup" subtitle="Header fields for this audit session" />
        <div className="p-4 grid grid-cols-1 gap-4">
          {/* Row 1: Facility + Auditor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Plant / Facility</FieldLabel>
              <Select
                value={setup.facility_name}
                onChange={v => setSetupField('facility_name', v)}
                options={getFacilityOptions()}
                placeholder="Select facility…"
              />
            </div>
            <div>
              <FieldLabel required>Auditor Name</FieldLabel>
              <input
                type="text"
                value={setup.auditor_name}
                onChange={e => setSetupField('auditor_name', e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Row 2: Category + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Audit Category</FieldLabel>
              <Select
                value={setup.audit_category}
                onChange={v => setSetupField('audit_category', v)}
                options={AUDIT_CATEGORIES}
                placeholder="Select category — drives question bank"
              />
              <p className="text-xs text-gray-400 mt-1">
                <Info size={10} className="inline mr-1" />
                Selecting a category filters the question bank in Section 2.
              </p>
            </div>
            <div>
              <FieldLabel required>Audit Date</FieldLabel>
              <input
                type="date"
                value={setup.audit_date}
                onChange={e => setSetupField('audit_date', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Areas multi-select */}
          <div>
            <FieldLabel>Location / Area Being Audited</FieldLabel>
            <div className="flex flex-wrap gap-2 mt-1">
              {LOCATION_OPTIONS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    setup.audit_areas.includes(area)
                      ? 'bg-blue-800 text-white border-blue-800'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
            {setup.audit_areas.length > 0 && (
              <p className="text-xs text-blue-700 mt-1">Selected: {setup.audit_areas.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Dynamic Findings ───────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <SectionHeader
          num="2"
          title="Finding Entry"
          subtitle="Each finding becomes one record. Add as many observations as needed."
        />
        <div className="p-4">
          {/* Live summary */}
          {findings.length > 0 && <SummaryBar findings={findings} />}

          {/* Loading indicator for question bank */}
          {loadingQB && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Loader size={14} className="animate-spin" /> Loading question bank…
            </div>
          )}

          {/* Finding cards */}
          {findings.map((f, idx) => (
            <FindingCard
              key={f._id}
              finding={f}
              index={idx}
              questionBank={questionBank}
              categoryFilter={setup.audit_category}
              onUpdate={changes => updateFinding(idx, changes)}
              onRemove={() => removeFinding(idx)}
            />
          ))}

          {/* Add finding button */}
          <button
            type="button"
            onClick={addFinding}
            className="w-full border-2 border-dashed border-blue-300 text-blue-700 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Finding / Observation
          </button>
        </div>
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-blue-800 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader size={16} className="animate-spin" /> Submitting…</>
          ) : (
            <><ClipboardCheck size={16} /> Submit Audit</>
          )}
        </button>
      </div>
    </form>
  );
}
