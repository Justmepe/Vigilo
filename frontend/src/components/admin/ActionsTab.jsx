/**
 * Action Tracker Tab — corrective & preventive actions with priority, overdue highlighting
 */
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';

const ACTIONS = [
  { id: 'ACT-094', title: 'Install anti-slip matting at loading dock B',          source: 'INC-2024-047', priority: 'H', owner: 'J. Williams', due: '2024-03-21', status: 'In Progress',  progress: 60, category: 'Engineering' },
  { id: 'ACT-093', title: 'Update PTW register with expired permit process',       source: 'Audit-Q1',    priority: 'M', owner: 'K. Tanaka',  due: '2024-03-28', status: 'In Progress',  progress: 30, category: 'Administrative' },
  { id: 'ACT-092', title: 'Renew H2S certification for 3 workers (see Training)',  source: 'Training',    priority: 'C', owner: 'C. Davis',   due: '2024-03-18', status: 'Overdue',      progress: 0,  category: 'Training' },
  { id: 'ACT-091', title: 'Inspect and tag racking damaged by forklift FL-04',    source: 'INC-2024-045', priority: 'H', owner: 'M. Flores',  due: '2024-03-15', status: 'Overdue',      progress: 80, category: 'Engineering' },
  { id: 'ACT-090', title: 'Implement pedestrian/forklift exclusion zones in Bay 3',source: 'RSK-003',    priority: 'H', owner: 'T. Reed',     due: '2024-04-05', status: 'Not Started',  progress: 0,  category: 'Engineering' },
  { id: 'ACT-089', title: 'Restock spill kits at tank farm (all 4 stations)',      source: 'Inspection',  priority: 'M', owner: 'R. Singh',   due: '2024-02-28', status: 'Closed',       progress: 100, category: 'Maintenance' },
  { id: 'ACT-088', title: 'Review and update emergency evacuation maps',           source: 'Drill',       priority: 'L', owner: 'A. Petrov',  due: '2024-04-20', status: 'Not Started',  progress: 0,  category: 'Administrative' },
  { id: 'ACT-087', title: 'Install convex mirrors at blind corners in warehouse',  source: 'RSK-003',     priority: 'H', owner: 'M. Flores',  due: '2024-04-10', status: 'In Progress',  progress: 45, category: 'Engineering' },
  { id: 'ACT-086', title: 'Conduct toolbox talk on chemical handling procedures',  source: 'RSK-001',     priority: 'M', owner: 'K. Tanaka',  due: '2024-03-29', status: 'In Progress',  progress: 70, category: 'Training' },
  { id: 'ACT-085', title: 'Audit confined space rescue equipment — all 6 spaces',  source: 'RSK-001',     priority: 'C', owner: 'S. O\'Brien', due: '2024-03-14', status: 'Overdue',      progress: 0,  category: 'Maintenance' },
];

const STATUSES = ['All Status','Not Started','In Progress','Overdue','Closed'];
const PRIORITIES = ['All Priority','C','H','M','L'];
const PRI_COLORS = { C: '#dc2626', H: '#ea580c', M: '#f59e0b', L: '#16a34a' };
const PRI_LABELS = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' };

const ActionsTab = () => {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('All Status');
  const [priority, setPriority] = useState('All Priority');

  const filtered = ACTIONS.filter(a =>
    (status   === 'All Status'   || a.status   === status) &&
    (priority === 'All Priority' || a.priority === priority) &&
    (search === '' || a.title.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search))
  );

  const overdue    = ACTIONS.filter(a => a.status === 'Overdue').length;
  const open       = ACTIONS.filter(a => a.status !== 'Closed').length;
  const closed     = ACTIONS.filter(a => a.status === 'Closed').length;
  const critical   = ACTIONS.filter(a => a.priority === 'C').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Total Open', value: open,     accent: '#2563eb', sub: `${ACTIONS.length} total` },
          { label: 'Overdue',    value: overdue,   accent: '#dc2626', sub: 'Past due date' },
          { label: 'Critical',   value: critical,  accent: '#ea580c', sub: 'Immediate action' },
          { label: 'Closed MTD', value: closed,    accent: '#16a34a', sub: 'Completed actions' },
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
