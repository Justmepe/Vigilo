/**
 * Risk Register Tab — hazard identification, likelihood × severity matrix
 */
import React, { useState } from 'react';
import { Plus, Search, Download } from 'lucide-react';

const RISKS = [
  { id: 'RSK-001', hazard: 'Chemical Exposure — H2S gas in confined spaces', category: 'Chemical',   likelihood: 3, severity: 5, residual: 'H', control: 'Gas detection, PPE, buddy system, rescue plan', owner: 'K. Tanaka',  review: '2024-04-01', status: 'Active'   },
  { id: 'RSK-002', hazard: 'Working at Height — mezzanine & elevated platforms', category: 'Physical',   likelihood: 2, severity: 4, residual: 'H', control: 'Fall arrest harness, edge protection, TAPS permit', owner: 'M. Flores',  review: '2024-04-15', status: 'Active'   },
  { id: 'RSK-003', hazard: 'Forklift/Pedestrian Interaction',                   category: 'Traffic',    likelihood: 3, severity: 4, residual: 'H', control: 'Segregated walkways, speed limit 5km/h, spotters', owner: 'J. Williams', review: '2024-03-20', status: 'Overdue'  },
  { id: 'RSK-004', hazard: 'Electrical — live equipment maintenance',            category: 'Electrical', likelihood: 2, severity: 5, residual: 'M', control: 'LOTO procedure, qualified electricians only',      owner: 'T. Reed',     review: '2024-05-01', status: 'Active'   },
  { id: 'RSK-005', hazard: 'Manual Handling — bulk bag lifting operations',      category: 'Ergonomic',  likelihood: 4, severity: 2, residual: 'M', control: 'Mechanical aids, max 15kg manual, team lifts',    owner: 'C. Davis',    review: '2024-04-10', status: 'Active'   },
  { id: 'RSK-006', hazard: 'Spill / Environmental — fuel storage tank farm',     category: 'Environmental', likelihood: 2, severity: 3, residual: 'M', control: 'Secondary containment, spill kits, weekly checks', owner: 'R. Singh',    review: '2024-05-15', status: 'Active'   },
  { id: 'RSK-007', hazard: 'Noise — grinding and cutting operations',            category: 'Physical',   likelihood: 5, severity: 2, residual: 'L', control: 'Mandatory hearing protection zone, audiometry',    owner: 'A. Petrov',   review: '2024-06-01', status: 'Controlled'},
  { id: 'RSK-008', hazard: 'Fire — welding and hot work near combustibles',      category: 'Fire',       likelihood: 2, severity: 5, residual: 'H', control: 'PTW system, fire watch, 10m clearance radius',    owner: 'S. O\'Brien',  review: '2024-04-05', status: 'Active'   },
];

// 5×5 risk matrix colours
const MATRIX_COLOR = [
  ['#dcfce7','#dcfce7','#fef9c3','#fef3c7','#ffedd5'],
  ['#dcfce7','#fef9c3','#fef3c7','#ffedd5','#fee2e2'],
  ['#fef9c3','#fef9c3','#ffedd5','#fee2e2','#fee2e2'],
  ['#fef3c7','#ffedd5','#fee2e2','#fee2e2','#fecaca'],
  ['#ffedd5','#fee2e2','#fee2e2','#fecaca','#fca5a5'],
];

const CATS = ['All Categories','Chemical','Physical','Traffic','Electrical','Ergonomic','Environmental','Fire'];
const STATUSES = ['All Status','Active','Controlled','Overdue'];

const RiskTab = () => {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('All Categories');
  const [status, setStatus] = useState('All Status');
  const [highlight, setHighlight] = useState(null); // {l, s}

  const filtered = RISKS.filter(r =>
    (cat    === 'All Categories' || r.category === cat) &&
    (status === 'All Status'     || r.status   === status) &&
    (search === '' || r.hazard.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search))
  );

  const score = r => r.likelihood * r.severity;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div className="sg4">
        {[
          { label: 'Total Risks',   value: RISKS.length,                          accent: '#2563eb', sub: 'Registered hazards' },
          { label: 'High / Critical', value: RISKS.filter(r=>['C','H'].includes(r.residual)).length, accent: '#dc2626', sub: 'Require action' },
          { label: 'Overdue Review', value: RISKS.filter(r=>r.status==='Overdue').length,  accent: '#ea580c', sub: 'Past review date' },
          { label: 'Controlled',    value: RISKS.filter(r=>r.status==='Controlled').length, accent: '#16a34a', sub: 'Residual low risk' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-accent" style={{ background: s.accent }} />
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="sg2b">
        {/* Risk Matrix */}
        <div className="acard">
          <div className="ch"><h3>Risk Matrix</h3></div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ width: 70 }} />
              {['1','2','3','4','5'].map(l => (
                <div key={l} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>L{l}</div>
              ))}
            </div>
            {[5,4,3,2,1].map(sev => (
              <div key={sev} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <div style={{ width: 70, fontSize: 10, color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center' }}>S{sev}</div>
                {[1,2,3,4,5].map(lik => {
                  const score = lik * sev;
                  const count = RISKS.filter(r => r.likelihood === lik && r.severity === sev).length;
                  return (
                    <div key={lik} style={{
                      flex: 1, aspectRatio: '1', borderRadius: 5, background: MATRIX_COLOR[5-sev][lik-1],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: count ? 13 : 10, fontWeight: 700, color: count ? '#1e293b' : '#94a3b8',
                      cursor: count ? 'pointer' : 'default', border: highlight?.l===lik&&highlight?.s===sev ? '2px solid #1d4ed8' : '1px solid rgba(0,0,0,0.04)',
                    }} onClick={() => setHighlight(count && (highlight?.l===lik&&highlight?.s===sev) ? null : count ? {l:lik,s:sev} : null)}
                    role="button" tabIndex={count ? 0 : -1} onKeyDown={e => e.key === 'Enter' && count && setHighlight(highlight?.l===lik&&highlight?.s===sev ? null : {l:lik,s:sev})}>
                      {count || score}
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {[['#dcfce7','Low'],['#fef3c7','Medium'],['#ffedd5','High'],['#fee2e2','Critical']].map(([c,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: '#64748b' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By category */}
        <div className="acard">
          <div className="ch"><h3>Risks by Category</h3></div>
          {['Chemical','Physical','Traffic','Electrical','Ergonomic','Environmental','Fire'].map(c => {
            const count = RISKS.filter(r => r.category === c).length;
            const pct = Math.round((count / RISKS.length) * 100);
            return (
              <div key={c} style={{ padding: '8px 18px', borderBottom: '0.5px solid #f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12.5 }}>
                  <span style={{ color: '#1e293b' }}>{c}</span>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>{count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: '#2563eb' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Register table */}
      <div className="acard">
        <div className="ch">
          <h3>Risk Register</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sec"><Download size={13} /> Export</button>
            <button className="btn-pri"><Plus size={13} /> Add Risk</button>
          </div>
        </div>
        <div style={{ padding: '10px 18px', borderBottom: '0.5px solid #f1f5f9', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, outline: 'none', boxSizing: 'border-box' }}
              placeholder="Search risks…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={cat} onChange={e => setCat(e.target.value)}>
            {CATS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Hazard</th><th>Category</th><th>L</th><th>S</th><th>Score</th><th>Residual</th><th>Owner</th><th>Review</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#7c3aed' }}>{r.id}</span></td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.hazard}>{r.hazard}</td>
                  <td><span className="badge b-purple">{r.category}</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{r.likelihood}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{r.severity}</td>
                  <td style={{ textAlign: 'center' }}><span style={{ fontWeight: 800, color: score(r) >= 15 ? '#dc2626' : score(r) >= 9 ? '#ea580c' : '#16a34a' }}>{score(r)}</span></td>
                  <td><span className={`risk-pill risk-${r.residual}`}>{r.residual === 'C' ? 'Critical' : r.residual === 'H' ? 'High' : r.residual === 'M' ? 'Medium' : 'Low'}</span></td>
                  <td>{r.owner}</td>
                  <td style={{ fontSize: 11.5 }}>{r.review}</td>
                  <td><span className={`badge ${r.status === 'Controlled' ? 'b-green' : r.status === 'Overdue' ? 'b-red' : 'b-blue'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiskTab;
