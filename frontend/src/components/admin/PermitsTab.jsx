/**
 * Permits to Work Tab — PTW authorisation & tracking
 */
import React, { useState, useEffect } from 'react';
import { Plus, Search, FileCheck, Clock, CheckCircle } from 'lucide-react';
import apiClient from '../../services/api/client';

const TYPES = ['All Types','Hot Work','Confined Space','Electrical','Work at Height','Excavation'];
const STATUSES = ['All Status','Active','Pending','Closed'];

const TYPE_COLORS = {
  'Hot Work':       { bg: '#ffedd5', color: '#ea580c' },
  'Confined Space': { bg: '#fee2e2', color: '#dc2626' },
  'Electrical':     { bg: '#fef3c7', color: '#f59e0b' },
  'Work at Height': { bg: '#ede9fe', color: '#7c3aed' },
  'Excavation':     { bg: '#dbeafe', color: '#1d4ed8' },
};

const PermitsTab = () => {
  const [permits, setPermits] = useState([]);
  const [counts, setCounts]   = useState({ total: 0, active: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [type, setType]       = useState('All Types');
  const [status, setStatus]   = useState('All Status');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/permits');
        if (res.data.success) {
          setPermits(res.data.data);
          setCounts(res.data.counts);
        }
      } catch (err) {
        setError('Failed to load permits');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = permits.filter(p =>
    (type   === 'All Types'  || p.type   === type) &&
    (status === 'All Status' || p.status === status) &&
    (search === '' || p.id.includes(search) || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
  );

  const critical = permits.filter(p => p.risk === 'C').length;
  const closed   = permits.filter(p => p.status === 'Closed').length;

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Active Permits',   value: counts.active,  accent: '#16a34a', sub: 'Currently in progress' },
          { label: 'Pending Approval', value: counts.pending, accent: '#f59e0b', sub: 'Awaiting sign-off' },
          { label: 'Critical Risk',    value: critical,       accent: '#dc2626', sub: 'Highest risk category' },
          { label: 'Closed This Month',value: closed,         accent: '#2563eb', sub: 'Completed permits' },
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
          <h3>Permit Register</h3>
          <button className="btn-pri"><Plus size={13} /> New Permit</button>
        </div>

        <div style={{ padding: '10px 18px', borderBottom: '0.5px solid #f1f5f9', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, outline: 'none', boxSizing: 'border-box' }}
              placeholder="Search permits…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(o => <option key={o}>{o}</option>)}
          </select>
          <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
            value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {filtered.map(p => {
          const tc = TYPE_COLORS[p.type] || { bg: '#f1f5f9', color: '#475569' };
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
              borderBottom: '0.5px solid #f8fafc',
              background: p.status === 'Active' ? '#f0fdf4' : p.status === 'Pending' ? '#fffbeb' : undefined,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tc.bg, flexShrink: 0 }}>
                {p.status === 'Active'  ? <FileCheck size={18} color={tc.color} /> :
                 p.status === 'Pending' ? <Clock size={18} color="#f59e0b" /> :
                                          <CheckCircle size={18} color="#16a34a" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#1d4ed8' }}>{p.id}</span>
                  <span className="badge" style={{ background: tc.bg, color: tc.color }}>{p.type}</span>
                  <span className={`risk-pill risk-${p.risk}`}>{p.risk === 'C' ? 'Critical' : p.risk === 'H' ? 'High' : p.risk === 'M' ? 'Medium' : 'Low'}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {p.location} · Issuer: {p.issuer} · Worker: {p.worker}
                  {p.issued && ` · ${p.issued.split(' ')[0]} ${p.issued.split(' ')[1]}–${p.expires?.split(' ')[1]}`}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span className={`badge ${p.status === 'Active' ? 'b-green' : p.status === 'Pending' ? 'b-amber' : 'b-gray'}`}>{p.status}</span>
                {p.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="mini-btn green">Approve</button>
                    <button className="mini-btn">Reject</button>
                  </div>
                )}
                {p.status === 'Active' && <button className="mini-btn">Close</button>}
                {p.status === 'Closed' && <button className="mini-btn">View</button>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No permits match the current filters</div>
        )}
      </div>
    </div>
  );
};

export default PermitsTab;
