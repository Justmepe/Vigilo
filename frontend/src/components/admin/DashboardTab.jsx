/**
 * EHS Dashboard Tab — live safety overview with stats, alerts, heatmap, timeline
 */
import React, { useState } from 'react';
import { AlertTriangle, Clock, Phone, Radio } from 'lucide-react';

const STATS = [
  { label: 'Days Without Incident', value: '47', sub: '+3 from last week', subClass: 'up', accent: '#16a34a' },
  { label: 'Open Action Items',     value: '12', sub: '3 overdue',         subClass: 'dn', accent: '#ea580c' },
  { label: 'Workers on Site',       value: '84', sub: '6 shifts active',   subClass: '',   accent: '#1d4ed8' },
  { label: 'Training Compliance',   value: '91%', sub: '↑ 4% this month',  subClass: 'up', accent: '#7c3aed' },
];

const ALERTS = [
  { id: 1, type: 'critical', icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2', text: 'Hot work permit PTW-2024-031 expires in 2 hours', time: '14:22' },
  { id: 2, type: 'warning',  icon: Clock,         color: '#ea580c', bg: '#ffedd5', text: 'Forklift inspection overdue — Unit FL-04, Bay 3',  time: '09:15' },
  { id: 3, type: 'warning',  icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7', text: '3 workers with expired H2S certification',          time: 'Yesterday' },
];

const CHECKLIST = [
  { id: 1, text: 'Morning safety briefing — Day shift', done: true  },
  { id: 2, text: 'Fire extinguisher check — Building A', done: true  },
  { id: 3, text: 'Forklift pre-start inspection', done: false },
  { id: 4, text: 'Hazardous materials storage audit',   done: false },
  { id: 5, text: 'Emergency exit walkthrough',          done: false },
];

const TIMELINE = [
  { color: '#dc2626', time: '14:32', title: 'Near Miss Reported', sub: 'Loading dock — slip hazard identified, J. Williams' },
  { color: '#16a34a', time: '11:45', title: 'PTW Issued',         sub: 'Hot work permit #031 — Processing area' },
  { color: '#2563eb', time: '09:00', title: 'Toolbox Talk',       sub: '17 workers attended — Heat stress awareness' },
  { color: '#f59e0b', time: '08:15', title: 'Action Closed',      sub: 'ACT-089 — Spill kit restocked, verified by T. Reed' },
  { color: '#7c3aed', time: 'Yest.', title: 'Inspection Complete',sub: 'Monthly fire safety — 94% compliance score' },
];

// 7×5 heatmap grid (Mon–Sun, last 5 weeks)
const HEATMAP = Array.from({ length: 35 }, (_, i) => {
  const seed = [0,0,1,2,0,0,1,0,2,1,3,0,1,0,0,1,2,4,0,1,0,0,1,1,2,0,0,0,1,0,2,1,0,0,1][i] ?? 0;
  return seed;
});
const DAYS = ['M','T','W','T','F','S','S'];

const DashboardTab = () => {
  const [checks, setChecks] = useState(CHECKLIST);
  const toggle = id => setChecks(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  const done = checks.filter(c => c.done).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat cards */}
      <div className="sg4">
        {STATS.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-accent" style={{ background: s.accent }} />
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.accent }}>{s.value}</div>
            <div className={`stat-sub ${s.subClass}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="sg2">
        {/* Alerts */}
        <div className="acard">
          <div className="ch">
            <h3>Active Alerts</h3>
            <span className="badge b-red">{ALERTS.length} Active</span>
          </div>
          {ALERTS.map(a => (
            <div key={a.id} className="arow">
              <div className="row-icon" style={{ background: a.bg }}>
                <a.icon size={15} color={a.color} />
              </div>
              <div className="row-main">
                <div className="row-title">{a.text}</div>
                <div className="row-meta">{a.time}</div>
              </div>
              <span className={`badge ${a.type === 'critical' ? 'b-red' : 'b-amber'}`}>
                {a.type === 'critical' ? 'Critical' : 'Warning'}
              </span>
            </div>
          ))}
        </div>

        {/* Incident heatmap */}
        <div className="acard">
          <div className="ch">
            <h3>Incident Heatmap</h3>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Last 5 weeks</span>
          </div>
          <div style={{ padding: '8px 18px 4px', display: 'flex', gap: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: '#94a3b8', fontWeight: 700 }}>{d}</div>
            ))}
          </div>
          <div className="heatmap-grid">
            {HEATMAP.map((v, i) => (
              <div key={i} className={`hm-cell hm-${v}`} title={`${v} incident${v !== 1 ? 's' : ''}`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '6px 18px 14px', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Less</span>
            {[0,1,2,3,4].map(v => <div key={v} className={`hm-cell hm-${v}`} style={{ width: 10, height: 10, borderRadius: 2 }} />)}
            <span style={{ fontSize: 10, color: '#94a3b8' }}>More</span>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="sg2">
        {/* Timeline */}
        <div className="acard">
          <div className="ch"><h3>Recent Activity</h3></div>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className="tl-item">
                <div style={{ position: 'relative' }}>
                  <div className="tl-dot" style={{ background: t.color }} />
                  {i < TIMELINE.length - 1 && <div className="tl-line" />}
                </div>
                <div className="tl-content">
                  <div className="tl-time">{t.time}</div>
                  <div className="tl-text">{t.title}</div>
                  <div className="tl-sub">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's checklist + SOS */}
        <div className="acard">
          <div className="ch">
            <h3>Today's Inspections</h3>
            <span className="badge b-blue">{done}/{checks.length}</span>
          </div>
          <div style={{ padding: '4px 0' }}>
            {checks.map(c => (
              <div key={c.id} className="checklist-item">
                <div className={`cb${c.done ? ' checked' : ''}`} onClick={() => toggle(c.id)} role="checkbox" aria-checked={c.done} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggle(c.id)}>
                  {c.done && <svg width="9" height="9" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="#fff" strokeWidth="2"/></svg>}
                </div>
                <span style={{ fontSize: 12.5, color: c.done ? '#94a3b8' : '#1e293b', textDecoration: c.done ? 'line-through' : 'none', flex: 1 }}>
                  {c.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 14px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <button className="btn-sec" style={{ justifyContent: 'center' }}>
                <Phone size={13} /> Emergency
              </button>
              <button className="btn-sec" style={{ justifyContent: 'center' }}>
                <Radio size={13} /> Alert All
              </button>
            </div>
            <button className="sos-btn">
              <AlertTriangle size={16} /> SOS — EMERGENCY REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
