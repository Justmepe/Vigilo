/**
 * Incidents Tab — incident log with INC-xxx IDs, severity, AI indicator
 */
import React, { useState } from 'react';
import { Search, Plus, FileText, Download } from 'lucide-react';

const INCIDENTS = [
  { id: 'INC-2024-047', date: '2024-03-14', type: 'Near Miss',       severity: 'M', location: 'Loading Dock B',   description: 'Slip hazard — water accumulation near forklift path',                    reporter: 'J. Williams',  status: 'Investigating', ai: true  },
  { id: 'INC-2024-046', date: '2024-03-12', type: 'First Aid',       severity: 'L', location: 'Processing Line 2', description: 'Minor laceration from packaging material, treated on-site',              reporter: 'T. Reed',      status: 'Closed',        ai: true  },
  { id: 'INC-2024-045', date: '2024-03-10', type: 'Property Damage', severity: 'M', location: 'Warehouse Bay 3',   description: 'Forklift FL-04 struck racking — no injuries, structural check needed',   reporter: 'M. Flores',    status: 'Action Raised', ai: false },
  { id: 'INC-2024-044', date: '2024-03-07', type: 'Near Miss',       severity: 'H', location: 'Chemical Store',    description: 'Unlabelled drum found in hazmat area — potential exposure risk',          reporter: 'K. Tanaka',    status: 'Closed',        ai: true  },
  { id: 'INC-2024-043', date: '2024-03-04', type: 'Injury',          severity: 'H', location: 'Maintenance Shop',  description: 'Sprained ankle — worker slipped from step ladder during HVAC work',      reporter: 'C. Davis',     status: 'Closed',        ai: true  },
  { id: 'INC-2024-042', date: '2024-02-28', type: 'Spill',           severity: 'M', location: 'Tank Farm',         description: '20L hydraulic oil spill contained within berm — no environmental impact', reporter: 'R. Singh',     status: 'Closed',        ai: false },
  { id: 'INC-2024-041', date: '2024-02-22', type: 'Near Miss',       severity: 'C', location: 'High Bay Area',     description: 'Unsecured load overhead — crane operator raised alarm immediately',        reporter: 'S. O\'Brien',  status: 'Investigating', ai: true  },
  { id: 'INC-2024-040', date: '2024-02-19', type: 'First Aid',       severity: 'L', location: 'Admin Building',    description: 'Eye irritation from cleaning spray — rinsed, no medical needed',          reporter: 'A. Petrov',    status: 'Closed',        ai: false },
];

const TYPE_OPTS = ['All Types','Near Miss','First Aid','Injury','Property Damage','Spill'];
const STATUS_OPTS = ['All Status','Investigating','Action Raised','Closed'];

const SEV_LABELS = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' };

const IncidentsTab = () => {
  const [search, setSearch]   = useState('');
  const [type, setType]       = useState('All Types');
  const [status, setStatus]   = useState('All Status');
  const [selected, setSelected] = useState(null);

  const filtered = INCIDENTS.filter(i =>
    (type   === 'All Types'   || i.type   === type) &&
    (status === 'All Status'  || i.status === status) &&
    (search === '' || i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    critical: INCIDENTS.filter(i => i.severity === 'C').length,
    high: INCIDENTS.filter(i => i.severity === 'H').length,
    open: INCIDENTS.filter(i => i.status !== 'Closed').length,
    mtd: INCIDENTS.filter(i => i.date.startsWith('2024-03')).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div className="sg4">
        {[
          { label: 'MTD Incidents',   value: counts.mtd,      accent: '#2563eb', sub: 'March 2024' },
          { label: 'Open / Active',   value: counts.open,     accent: '#ea580c', sub: `${INCIDENTS.length} total` },
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
