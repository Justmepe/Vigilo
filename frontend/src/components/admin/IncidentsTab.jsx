/**
 * Incidents Tab — incident log with INC-xxx IDs, severity, AI indicator
 */
import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Download } from 'lucide-react';
import apiClient from '../../services/api/client';

const TYPE_OPTS = ['All Types','Near Miss','First Aid','Injury','Property Damage','Spill'];
const STATUS_OPTS = ['All Status','Investigating','Action Raised','Closed'];

const SEV_LABELS = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' };

const IncidentsTab = () => {
  const [incidents, setIncidents] = useState([]);
  const [counts, setCounts]       = useState({ total: 0, open: 0, critical: 0, high: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [type, setType]           = useState('All Types');
  const [status, setStatus]       = useState('All Status');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/incidents');
        if (res.data.success) {
          setIncidents(res.data.data);
          setCounts(res.data.counts);
        }
      } catch (err) {
        setError('Failed to load incidents');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = incidents.filter(i =>
    (type   === 'All Types'   || i.type   === type) &&
    (status === 'All Status'  || i.status === status) &&
    (search === '' || i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div className="sg4">
        {[
          { label: 'MTD Incidents',   value: counts.total,    accent: '#2563eb', sub: 'This month' },
          { label: 'Open / Active',   value: counts.open,     accent: '#ea580c', sub: `${incidents.length} total` },
          { label: 'High Severity',   value: counts.high,     accent: '#f59e0b', sub: 'Require attention' },
          { label: 'Critical',        value: counts.critical, accent: '#dc2626', sub: 'Immediate action' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-accent" style={{ background: s.accent }} />
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="acard">
        <div className="ch">
          <h3>Incident Register</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sec"><Download size={13} /> Export</button>
            <button className="btn-pri"><Plus size={13} /> New Incident</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '10px 18px', borderBottom: '0.5px solid #f1f5f9', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, outline: 'none', boxSizing: 'border-box' }}
              placeholder="Search incidents…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={type} onChange={e => setType(e.target.value)}>
            {TYPE_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Type</th><th>Severity</th>
                <th>Location</th><th>Description</th><th>Reporter</th>
                <th>Status</th><th>AI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === inc.id ? null : inc)}>
                  <td><span style={{ fontWeight: 700, color: '#1d4ed8', fontFamily: 'monospace', fontSize: 11.5 }}>{inc.id}</span></td>
                  <td>{inc.date}</td>
                  <td><span className="badge b-blue">{inc.type}</span></td>
                  <td><span className={`risk-pill risk-${inc.severity}`}>{SEV_LABELS[inc.severity]}</span></td>
                  <td>{inc.location}</td>
                  <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.description}</td>
                  <td>{inc.reporter}</td>
                  <td>
                    <span className={`badge ${inc.status === 'Closed' ? 'b-green' : inc.status === 'Investigating' ? 'b-amber' : 'b-orange'}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {inc.ai && <FileText size={13} color="#7c3aed" title="AI report available" />}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No incidents match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div style={{ margin: '0 18px 18px', padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '0.5px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{selected.id} — Detail</span>
              <button className="mini-btn" onClick={() => setSelected(null)}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 12.5 }}>
              <div><span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>TYPE</span><br />{selected.type}</div>
              <div><span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>LOCATION</span><br />{selected.location}</div>
              <div><span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>DATE</span><br />{selected.date}</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12.5 }}>
              <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>DESCRIPTION</span>
              <p style={{ margin: '4px 0 0', color: '#374151' }}>{selected.description}</p>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn-pri">Open Full Report</button>
              {selected.ai && <button className="btn-sec"><FileText size={13} /> View AI Report</button>}
              <button className="btn-sec">Raise Action</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentsTab;
