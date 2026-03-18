/**
 * Workers on Site Tab — shift roster, check-in log, PPE compliance
 */
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import apiClient from '../../services/api/client';

const VISITORS = [
  { name: 'Dr. I. Park',     company: 'WorkSafe Inspector', purpose: 'Annual compliance audit', checkin: '09:00', checkout: null,    host: 'S. O\'Brien', badge: 'V-041' },
  { name: 'J. Carter',       company: 'HVAC Solutions Ltd', purpose: 'Maintenance contract',    checkin: '07:30', checkout: '11:45', host: 'T. Reed',     badge: 'V-040' },
];

const STATUS_COLOR = { 'On Site': '#16a34a', 'Expected': '#f59e0b', 'Scheduled': '#2563eb' };

const WorkersTab = () => {
  const [shifts, setShifts]     = useState([]);
  const [counts, setCounts]     = useState({ total: 0, on_site: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeShift, setActiveShift] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/attendance/today');
        if (res.data.success) {
          setShifts(res.data.shifts);
          setCounts(res.data.counts);
        }
      } catch (err) {
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  const shift  = shifts[activeShift] || { workers: [] };
  const allWorkers = shifts.flatMap(s => s.workers || []);
  const noPPE  = allWorkers.filter(w => w.status === 'On Site' && w.ppe === false).length;
  const onSiteWorkers = allWorkers.filter(w => w.status === 'On Site');
  const ppeComp = onSiteWorkers.length
    ? Math.round((onSiteWorkers.filter(w => w.ppe === true).length / onSiteWorkers.length) * 100)
    : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Currently on Site', value: counts.on_site,   accent: '#16a34a', sub: `${counts.total} total incl. expected` },
          { label: 'Active Shifts',     value: shifts.length,    accent: '#2563eb', sub: `${shifts.length} shifts today` },
          { label: 'PPE Compliance',    value: `${ppeComp}%`,    accent: ppeComp === 100 ? '#16a34a' : '#ea580c', sub: 'Checked workers' },
          { label: 'PPE Non-Compliance',value: noPPE,            accent: '#dc2626', sub: 'Workers without PPE' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-accent" style={{ background: s.accent }} />
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="sg2">
        {/* Shift roster */}
        <div className="acard">
          <div className="ch">
            <h3>Shift Roster</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {shifts.map((s, i) => (
                <button key={i} className={`mini-btn${activeShift === i ? ' green' : ''}`} onClick={() => setActiveShift(i)}>
                  {s.shift_name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 18px', borderBottom: '0.5px solid #f1f5f9' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{shift.shift_name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Supervisor: {shift.supervisor}</div>
          </div>
          {(shift.workers || []).map((w, i) => (
            <div key={i} className="arow">
              <div className="avatar" style={{
                background: w.status === 'On Site' ? '#dcfce7' : '#f1f5f9',
                color: w.status === 'On Site' ? '#166534' : '#475569',
              }}>
                {w.name.charAt(0)}
              </div>
              <div className="row-main">
                <div className="row-title">{w.name}</div>
                <div className="row-meta">{w.role} · {w.area}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <span className="badge" style={{ background: STATUS_COLOR[w.status] + '22', color: STATUS_COLOR[w.status] }}>{w.status}</span>
                {w.checkin && <span style={{ fontSize: 10.5, color: '#94a3b8' }}>In {w.checkin}</span>}
                {w.ppe === false && (
                  <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AlertTriangle size={10} /> No PPE
                  </span>
                )}
              </div>
            </div>
          ))}
          {shift.workers && shift.workers.length === 0 && (
            <div style={{ padding: 18, textAlign: 'center', color: '#94a3b8', fontSize: 12.5 }}>No workers on this shift</div>
          )}
        </div>

        {/* Visitors + site summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Site total visual */}
          <div className="acard" style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Site Headcount</div>
            {shifts.map((s, i) => {
              const workers = s.workers || [];
              const onSite = workers.filter(w => w.status === 'On Site').length;
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: '#475569' }}>{s.shift_name}</span>
                    <span style={{ fontWeight: 700 }}>{onSite}/{workers.length}</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 0 }}>
                    <div className="progress-fill" style={{
                      width: `${workers.length ? Math.round(onSite/workers.length*100) : 0}%`,
                      background: '#2563eb',
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: '0.5px solid #f1f5f9', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
              <span style={{ color: '#475569' }}>Visitors on site</span>
              <span style={{ fontWeight: 700 }}>{VISITORS.filter(v => !v.checkout).length}</span>
            </div>
          </div>

          {/* Visitor log */}
          <div className="acard">
            <div className="ch"><h3>Visitor Log</h3></div>
            {VISITORS.map(v => (
              <div key={v.badge} className="arow">
                <div className="avatar" style={{ background: '#ede9fe', color: '#5b21b6' }}>{v.name.charAt(0)}</div>
                <div className="row-main">
                  <div className="row-title">{v.name}</div>
                  <div className="row-meta">{v.company} · {v.purpose}</div>
                  <div className="row-meta">Badge {v.badge} · Host: {v.host} · In: {v.checkin}{v.checkout ? ` · Out: ${v.checkout}` : ''}</div>
                </div>
                <span className={`badge ${v.checkout ? 'b-gray' : 'b-green'}`}>{v.checkout ? 'Left' : 'On Site'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkersTab;
