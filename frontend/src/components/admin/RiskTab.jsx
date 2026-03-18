/**
 * Risk Register Tab — hazard identification, likelihood × severity matrix
 */
import React, { useState, useEffect } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import apiClient from '../../services/api/client';

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
  const [risks, setRisks]     = useState([]);
  const [counts, setCounts]   = useState({ total: 0, active: 0, high: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('All Categories');
  const [status, setStatus]   = useState('All Status');
  const [highlight, setHighlight] = useState(null); // {l, s}

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/risks');
        if (res.data.success) {
          setRisks(res.data.data);
          setCounts(res.data.counts);
        }
      } catch (err) {
        setError('Failed to load risk register');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = risks.filter(r =>
    (cat    === 'All Categories' || r.category === cat) &&
    (status === 'All Status'     || r.status   === status) &&
    (search === '' || r.hazard.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search))
  );

  const score = r => r.risk_score !== undefined ? r.risk_score : r.likelihood * r.severity_level;

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div className="sg4">
        {[
          { label: 'Total Risks',     value: counts.total,                                                  accent: '#2563eb', sub: 'Registered hazards' },
          { label: 'High / Critical', value: risks.filter(r=>['C','H'].includes(r.residual)).length,        accent: '#dc2626', sub: 'Require action' },
          { label: 'Overdue Review',  value: risks.filter(r=>r.status==='Overdue').length,                  accent: '#ea580c', sub: 'Past review date' },
          { label: 'Controlled',      value: risks.filter(r=>r.status==='Controlled').length,               accent: '#16a34a', sub: 'Residual low risk' },
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
                  const cellScore = lik * sev;
                  const count = risks.filter(r => r.likelihood === lik && (r.severity_level || r.severity) === sev).length;
                  return (
                    <div key={lik} style={{
                      flex: 1, aspectRatio: '1', borderRadius: 5, background: MATRIX_COLOR[5-sev][lik-1],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: count ? 13 : 10, fontWeight: 700, color: count ? '#1e293b' : '#94a3b8',
                      cursor: count ? 'pointer' : 'default', border: highlight?.l===lik&&highlight?.s===sev ? '2px solid #1d4ed8' : '1px solid rgba(0,0,0,0.04)',
                    }} onClick={() => setHighlight(count && (highlight?.l===lik&&highlight?.s===sev) ? null : count ? {l:lik,s:sev} : null)}
                    role="button" tabIndex={count ? 0 : -1} onKeyDown={e => e.key === 'Enter' && count && setHighlight(highlight?.l===lik&&highlight?.s===sev ? null : {l:lik,s:sev})}>
                      {count || cellScore}
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
            const count = risks.filter(r => r.category === c).length;
            const pct = risks.length ? Math.round((count / risks.length) * 100) : 0;
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
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{r.severity_level || r.severity}</td>
                  <td style={{ textAlign: 'center' }}><span style={{ fontWeight: 800, color: score(r) >= 15 ? '#dc2626' : score(r) >= 9 ? '#ea580c' : '#16a34a' }}>{score(r)}</span></td>
                  <td><span className={`risk-pill risk-${r.residual}`}>{r.residual === 'C' ? 'Critical' : r.residual === 'H' ? 'High' : r.residual === 'M' ? 'Medium' : 'Low'}</span></td>
                  <td>{r.owner}</td>
                  <td style={{ fontSize: 11.5 }}>{r.review}</td>
                  <td><span className={`badge ${r.status === 'Controlled' ? 'b-green' : r.status === 'Overdue' ? 'b-red' : 'b-blue'}`}>{r.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No risks match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiskTab;
