/**
 * Inspections Tab — monthly inspection schedule with progress bars
 */
import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import apiClient from '../../services/api/client';

const STATUSES = ['All Status','Complete','Overdue','Scheduled'];

const InspectionsTab = () => {
  const [inspections, setInspections] = useState([]);
  const [counts, setCounts]           = useState({ complete: 0, overdue: 0, scheduled: 0, avgScore: 0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [status, setStatus]           = useState('All Status');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/inspection-schedule');
        if (res.data.success) {
          setInspections(res.data.data);
          setCounts(res.data.counts);
        }
      } catch (err) {
        setError('Failed to load inspections');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = inspections.filter(i => status === 'All Status' || i.status === status);

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Completed MTD',  value: counts.complete,          accent: '#16a34a', sub: `of ${inspections.length} scheduled` },
          { label: 'Overdue',        value: counts.overdue,           accent: '#dc2626', sub: 'Require completion' },
          { label: 'Scheduled',      value: counts.scheduled,         accent: '#2563eb', sub: 'Upcoming this month' },
          { label: 'Avg Score',      value: `${counts.avgScore}%`,    accent: '#7c3aed', sub: 'Completed inspections' },
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
          <h3>Inspection Programme</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>{counts.complete}/{inspections.length} complete</span>
            <div style={{ width: 100 }} className="progress-bar">
              <div className="progress-fill" style={{ width: `${inspections.length ? Math.round(counts.complete/inspections.length*100) : 0}%`, background: '#16a34a' }} />
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
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No inspections found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionsTab;
