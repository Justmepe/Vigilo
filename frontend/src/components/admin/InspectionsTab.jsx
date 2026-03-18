/**
 * Inspections Tab — monthly inspection schedule with progress bars
 */
import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const INSPECTIONS = [
  { id: 'INS-024', name: 'Monthly Fire Safety Inspection',          area: 'All Buildings',     scheduled: '2024-03-01', completed: '2024-03-03', score: 94, status: 'Complete',  inspector: 'S. O\'Brien',  findings: 2, critical: 0 },
  { id: 'INS-025', name: 'Forklift Pre-start Audit',                area: 'Warehouse',         scheduled: '2024-03-05', completed: '2024-03-05', score: 100,status: 'Complete',  inspector: 'M. Flores',   findings: 0, critical: 0 },
  { id: 'INS-026', name: 'Chemical Storage & Handling Inspection',  area: 'Chemical Store',    scheduled: '2024-03-08', completed: '2024-03-09', score: 88, status: 'Complete',  inspector: 'K. Tanaka',   findings: 3, critical: 1 },
  { id: 'INS-027', name: 'Emergency Egress & Exit Inspection',      area: 'All Buildings',     scheduled: '2024-03-12', completed: null,         score: null,status: 'Overdue',   inspector: 'T. Reed',     findings: null, critical: null },
  { id: 'INS-028', name: 'PPE Inspection & Inventory Check',        area: 'PPE Store',         scheduled: '2024-03-15', completed: null,         score: null,status: 'Overdue',   inspector: 'C. Davis',    findings: null, critical: null },
  { id: 'INS-029', name: 'Lifting Equipment Annual Inspection',     area: 'Maintenance Bay',   scheduled: '2024-03-20', completed: null,         score: null,status: 'Scheduled', inspector: 'M. Flores',   findings: null, critical: null },
  { id: 'INS-030', name: 'Workplace Hygiene Inspection',            area: 'Processing Lines',  scheduled: '2024-03-22', completed: null,         score: null,status: 'Scheduled', inspector: 'R. Singh',    findings: null, critical: null },
  { id: 'INS-031', name: 'Electrical Safety Audit',                 area: 'All Switchboards',  scheduled: '2024-03-28', completed: null,         score: null,status: 'Scheduled', inspector: 'A. Petrov',   findings: null, critical: null },
  { id: 'INS-032', name: 'Monthly Hygiene Inspection (all areas)',  area: 'All Areas',         scheduled: '2024-03-30', completed: null,         score: null,status: 'Scheduled', inspector: 'J. Williams', findings: null, critical: null },
];

const STATUSES = ['All Status','Complete','Overdue','Scheduled'];

const InspectionsTab = () => {
  const [status, setStatus] = useState('All Status');

  const filtered = INSPECTIONS.filter(i => status === 'All Status' || i.status === status);
  const complete = INSPECTIONS.filter(i => i.status === 'Complete').length;
  const overdue  = INSPECTIONS.filter(i => i.status === 'Overdue').length;
  const sched    = INSPECTIONS.filter(i => i.status === 'Scheduled').length;
  const avgScore = Math.round(INSPECTIONS.filter(i => i.score).reduce((s, i) => s + i.score, 0) / INSPECTIONS.filter(i => i.score).length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Completed MTD',  value: complete, accent: '#16a34a', sub: `of ${INSPECTIONS.length} scheduled` },
          { label: 'Overdue',        value: overdue,  accent: '#dc2626', sub: 'Require completion' },
          { label: 'Scheduled',      value: sched,    accent: '#2563eb', sub: 'Upcoming this month' },
          { label: 'Avg Score',      value: `${avgScore}%`, accent: '#7c3aed', sub: 'Completed inspections' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-accent" style={{ background: s.accent }} />
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Month progress */}
      <div className="acard">
        <div className="ch">
          <h3>March 2024 — Inspection Programme</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>{complete}/{INSPECTIONS.length} complete</span>
            <div style={{ width: 100 }} className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.round(complete/INSPECTIONS.length*100)}%`, background: '#16a34a' }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '8px 18px 4px', display: 'flex', gap: 8 }}>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(o => <option key={o}>{o}</option>)}
          </select>
          <button className="btn-pri" style={{ marginLeft: 'auto' }}><Plus size={13} /> Schedule Inspection</button>
        </div>

        <div style={{ padding: '8px 0' }}>
          {filtered.map(ins => (
            <div key={ins.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
              borderBottom: '0.5px solid #f8fafc',
              background: ins.status === 'Overdue' ? '#fff8f8' : undefined,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: ins.status === 'Complete' ? '#dcfce7' : ins.status === 'Overdue' ? '#fee2e2' : '#dbeafe' }}>
                {ins.status === 'Complete'  ? <CheckCircle size={18} color="#16a34a" /> :
                 ins.status === 'Overdue'   ? <AlertTriangle size={18} color="#dc2626" /> :
                                              <Clock size={18} color="#2563eb" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{ins.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {ins.area} · Inspector: {ins.inspector} ·{' '}
                  {ins.status === 'Complete' ? `Completed ${ins.completed}` : `Scheduled ${ins.scheduled}`}
                </div>
                {ins.score !== null && (
                  <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 140, marginTop: 0 }}>
                      <div className="progress-fill" style={{ width: `${ins.score}%`, background: ins.score >= 90 ? '#16a34a' : ins.score >= 70 ? '#f59e0b' : '#dc2626' }} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: ins.score >= 90 ? '#16a34a' : ins.score >= 70 ? '#f59e0b' : '#dc2626' }}>{ins.score}%</span>
                    {ins.findings > 0 && <span style={{ fontSize: 11, color: '#64748b' }}>{ins.findings} finding{ins.findings !== 1 ? 's' : ''}{ins.critical > 0 ? `, ${ins.critical} critical` : ''}</span>}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className={`badge ${ins.status === 'Complete' ? 'b-green' : ins.status === 'Overdue' ? 'b-red' : 'b-blue'}`}>{ins.status}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {ins.status !== 'Complete' && <button className="mini-btn green">Start</button>}
                  {ins.status === 'Complete' && <button className="mini-btn">View Report</button>}
                  <button className="mini-btn">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspectionsTab;
