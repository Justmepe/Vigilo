/**
 * Action Tracker Tab — corrective & preventive actions with priority, overdue highlighting
 */
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import apiClient from '../../services/api/client';

const STATUSES = ['All Status','Not Started','In Progress','Overdue','Closed'];
const PRIORITIES = ['All Priority','C','H','M','L'];
const PRI_COLORS = { C: '#dc2626', H: '#ea580c', M: '#f59e0b', L: '#16a34a' };
const PRI_LABELS = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' };

const ActionsTab = () => {
  const [actions, setActions]   = useState([]);
  const [counts, setCounts]     = useState({ open: 0, overdue: 0, critical: 0, closed: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('All Status');
  const [priority, setPriority] = useState('All Priority');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/actions');
        if (res.data.success) {
          setActions(res.data.data);
          setCounts(res.data.counts);
        }
      } catch (err) {
        setError('Failed to load actions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = actions.filter(a =>
    (status   === 'All Status'   || a.status   === status) &&
    (priority === 'All Priority' || a.priority === priority) &&
    (search === '' || a.title.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search))
  );

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Total Open', value: counts.open,     accent: '#2563eb', sub: `${actions.length} total` },
          { label: 'Overdue',    value: counts.overdue,  accent: '#dc2626', sub: 'Past due date' },
          { label: 'Critical',   value: counts.critical, accent: '#ea580c', sub: 'Immediate action' },
          { label: 'Closed MTD', value: counts.closed,   accent: '#16a34a', sub: 'Completed actions' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-accent" style={{ background: s.accent }} />
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="acard">
        <div className="ch">
          <h3>Action Register</h3>
          <button className="btn-pri"><Plus size={13} /> New Action</button>
        </div>

        <div style={{ padding: '10px 18px', borderBottom: '0.5px solid #f1f5f9', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, outline: 'none', boxSizing: 'border-box' }}
              placeholder="Search actions…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(o => <option key={o}>{o}</option>)}
          </select>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {filtered.map(a => (
          <div key={a.id} className="action-item" style={{ background: a.status === 'Overdue' ? '#fff8f8' : undefined }}>
            <div className="priority-bar" style={{ background: PRI_COLORS[a.priority] }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#ea580c' }}>{a.id}</span>
                <span className={`badge ${a.priority === 'C' ? 'b-red' : a.priority === 'H' ? 'b-orange' : a.priority === 'M' ? 'b-amber' : 'b-green'}`}>{PRI_LABELS[a.priority]}</span>
                <span className="badge b-gray">{a.category}</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{a.title}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                <span>Source: {a.source}</span>
                <span>Owner: {a.owner}</span>
                <span style={{ color: a.status === 'Overdue' ? '#dc2626' : '#94a3b8', fontWeight: a.status === 'Overdue' ? 700 : 400 }}>
                  {a.status === 'Overdue' ? '⚠ Overdue · ' : ''}Due: {a.due}
                </span>
              </div>
              {a.progress > 0 && (
                <div className="progress-bar" style={{ marginTop: 6, width: 180 }}>
                  <div className="progress-fill" style={{ width: `${a.progress}%`, background: a.progress === 100 ? '#16a34a' : a.status === 'Overdue' ? '#dc2626' : '#2563eb' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span className={`badge ${a.status === 'Closed' ? 'b-green' : a.status === 'Overdue' ? 'b-red' : a.status === 'In Progress' ? 'b-blue' : 'b-gray'}`}>{a.status}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {a.status !== 'Closed' && <button className="mini-btn green">Mark Done</button>}
                <button className="mini-btn">Edit</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No actions match the current filters</div>
        )}
      </div>
    </div>
  );
};

export default ActionsTab;
