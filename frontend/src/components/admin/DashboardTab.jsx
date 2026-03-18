/**
 * EHS Dashboard Tab — live safety overview with stats, alerts, heatmap, timeline
 */
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Phone, Radio } from 'lucide-react';
import apiClient from '../../services/api/client';

const CHECKLIST_DEFAULT = [
  { id: 1, text: 'Morning safety briefing — Day shift', done: false },
  { id: 2, text: 'Fire extinguisher check — Building A', done: false },
  { id: 3, text: 'Forklift pre-start inspection', done: false },
  { id: 4, text: 'Hazardous materials storage audit',   done: false },
  { id: 5, text: 'Emergency exit walkthrough',          done: false },
];

// 7×5 heatmap grid (Mon–Sun, last 5 weeks)
const HEATMAP = Array.from({ length: 35 }, (_, i) => {
  const seed = [0,0,1,2,0,0,1,0,2,1,3,0,1,0,0,1,2,4,0,1,0,0,1,1,2,0,0,0,1,0,2,1,0,0,1][i] ?? 0;
  return seed;
});
const DAYS = ['M','T','W','T','F','S','S'];

const ALERT_ICON_MAP = { action: Clock, incident: AlertTriangle, permit: AlertTriangle };

const DashboardTab = () => {
  const [stats, setStats]   = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [checks, setChecks] = useState(CHECKLIST_DEFAULT);
  const toggle = id => setChecks(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  const done = checks.filter(c => c.done).length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/ehs-dashboard/stats');
        if (res.data.success !== false) {
          const d = res.data;
          setStats(d);
          setAlerts(d.recent_alerts || []);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  const STATS_CARDS = stats ? [
    { label: 'Days Without Incident', value: String(stats.days_without_incident ?? '—'), sub: 'No LTI',             subClass: 'up', accent: '#16a34a' },
    { label: 'Open Action Items',     value: String(stats.open_actions ?? '—'),           sub: `${stats.overdue_actions ?? 0} overdue`, subClass: stats.overdue_actions > 0 ? 'dn' : '', accent: '#ea580c' },
    { label: 'Workers on Site',       value: String(stats.workers_on_site ?? '—'),        sub: 'Active permits',    subClass: '',   accent: '#1d4ed8' },
    { label: 'Training Compliance',   value: `${stats.training_compliance_pct ?? '—'}%`,  sub: 'Active workers',    subClass: 'up', accent: '#7c3aed' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat cards */}
      <div className="sg4">
        {STATS_CARDS.map((s, i) => (
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
            <span className="badge b-red">{alerts.length} Active</span>
          </div>
          {alerts.map((a, idx) => {
            const IconComp = ALERT_ICON_MAP[a.alert_type] || AlertTriangle;
            const isCritical = a.level === 'critical';
            const color = isCritical ? '#dc2626' : a.level === 'warning' ? '#ea580c' : '#f59e0b';
            const bg    = isCritical ? '#fee2e2' : a.level === 'warning' ? '#ffedd5' : '#fef3c7';
            return (
              <div key={idx} className="arow">
                <div className="row-icon" style={{ background: bg }}>
                  <IconComp size={15} color={color} />
                </div>
                <div className="row-main">
                  <div className="row-title">{a.text}</div>
                  <div className="row-meta">{a.ref}</div>
                </div>
                <span className={`badge ${isCritical ? 'b-red' : 'b-amber'}`}>
                  {isCritical ? 'Critical' : 'Warning'}
                </span>
              </div>
            );
          })}
          {alerts.length === 0 && (
            <div style={{ padding: 18, textAlign: 'center', color: '#16a34a', fontSize: 12.5 }}>No active alerts ✓</div>
          )}
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
        {/* Stats summary row */}
        <div className="acard">
          <div className="ch"><h3>Month Summary</h3></div>
          <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats && [
              { label: 'Incidents MTD',   value: stats.incidents_mtd ?? '—',   color: '#ea580c' },
              { label: 'Active Permits',  value: stats.active_permits ?? '—',  color: '#16a34a' },
              { label: 'Overdue Actions', value: stats.overdue_actions ?? '—', color: '#dc2626' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '0.5px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
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
