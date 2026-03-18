/**
 * Training Matrix Tab — competency & certification tracking
 */
import React, { useState } from 'react';
import { Plus, Search, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const WORKERS = [
  { name: 'J. Williams', role: 'Line Lead',     certs: { h2s: 'valid', fa: 'valid',    forklift: 'valid',  confined: 'exp3',  fire: 'valid', wah: null,     loto: 'valid'  } },
  { name: 'T. Reed',     role: 'Maintenance',   certs: { h2s: 'valid', fa: 'valid',    forklift: null,     confined: 'valid', fire: 'valid', wah: 'valid',  loto: 'valid'  } },
  { name: 'M. Flores',   role: 'Supervisor',    certs: { h2s: 'valid', fa: 'valid',    forklift: 'valid',  confined: 'valid', fire: 'valid', wah: 'valid',  loto: 'valid'  } },
  { name: 'K. Tanaka',   role: 'EHS Officer',   certs: { h2s: 'exp1', fa: 'valid',    forklift: null,     confined: 'valid', fire: 'valid', wah: 'valid',  loto: 'valid'  } },
  { name: 'C. Davis',    role: 'Operator',      certs: { h2s: 'exp1', fa: 'exp2',     forklift: 'valid',  confined: null,    fire: 'valid', wah: null,     loto: 'valid'  } },
  { name: 'R. Singh',    role: 'Operator',      certs: { h2s: 'exp1', fa: 'valid',    forklift: null,     confined: null,    fire: 'valid', wah: null,     loto: null     } },
  { name: 'S. O\'Brien', role: 'Safety Officer', certs: { h2s: 'valid', fa: 'valid',   forklift: null,     confined: 'valid', fire: 'valid', wah: 'valid',  loto: 'valid'  } },
  { name: 'A. Petrov',   role: 'Operator',      certs: { h2s: 'valid', fa: 'valid',    forklift: 'valid',  confined: null,    fire: null,    wah: null,     loto: null     } },
  { name: 'L. Nguyen',   role: 'Line Lead',     certs: { h2s: 'valid', fa: 'valid',    forklift: 'valid',  confined: 'exp3',  fire: 'valid', wah: null,     loto: 'valid'  } },
  { name: 'P. Mwangi',   role: 'Operator',      certs: { h2s: null,    fa: 'valid',    forklift: null,     confined: null,    fire: 'valid', wah: null,     loto: null     } },
];

const CERT_COLS = [
  { key: 'h2s',      label: 'H2S',           required: ['Line Lead','Operator','Maintenance','Safety Officer','EHS Officer','Supervisor'] },
  { key: 'fa',       label: 'First Aid',     required: ['Line Lead','Supervisor','Safety Officer','EHS Officer','Maintenance'] },
  { key: 'forklift', label: 'Forklift',      required: ['Line Lead','Operator'] },
  { key: 'confined', label: 'Confined Space',required: ['Maintenance','Safety Officer','EHS Officer','Supervisor'] },
  { key: 'fire',     label: 'Fire Warden',   required: ['Supervisor','Safety Officer','EHS Officer'] },
  { key: 'wah',      label: 'Work @ Height', required: ['Maintenance','Safety Officer','EHS Officer'] },
  { key: 'loto',     label: 'LOTO',          required: ['Maintenance','Supervisor','EHS Officer'] },
];

// exp1 = expires ≤30d, exp2 = expires 31-60d, exp3 = expires 61-90d, valid = ok, null = N/A or not held
const CellIcon = ({ status, required }) => {
  if (!required) return <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>;
  if (!status)   return <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626' }}>✗</span>;
  if (status === 'valid') return <CheckCircle size={14} color="#16a34a" />;
  if (status === 'exp1')  return <AlertTriangle size={14} color="#dc2626" title="Expires &lt;30d" />;
  if (status === 'exp2')  return <Clock size={14} color="#f59e0b" title="Expires 31-60d" />;
  if (status === 'exp3')  return <Clock size={14} color="#94a3b8" title="Expires 61-90d" />;
  return null;
};

const compliance = (w) => {
  let req = 0, ok = 0;
  CERT_COLS.forEach(c => {
    if (c.required.includes(w.role)) {
      req++;
      if (w.certs[c.key] && w.certs[c.key] !== 'exp1') ok++;
    }
  });
  return req === 0 ? 100 : Math.round((ok / req) * 100);
};

const TrainingTab = () => {
  const [search, setSearch] = useState('');
  const filtered = WORKERS.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.role.toLowerCase().includes(search.toLowerCase()));

  const expiring30  = WORKERS.flatMap(w => CERT_COLS.filter(c => w.certs[c.key] === 'exp1')).length;
  const expiring60  = WORKERS.flatMap(w => CERT_COLS.filter(c => w.certs[c.key] === 'exp2')).length;
  const missing     = WORKERS.flatMap(w => CERT_COLS.filter(c => c.required.includes(w.role) && !w.certs[c.key])).length;
  const avgComp     = Math.round(WORKERS.reduce((s, w) => s + compliance(w), 0) / WORKERS.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Overall Compliance', value: `${avgComp}%`, accent: avgComp >= 90 ? '#16a34a' : '#ea580c', sub: `${WORKERS.length} workers tracked` },
          { label: 'Certs Expiring <30d', value: expiring30, accent: '#dc2626', sub: 'Urgent renewal needed' },
          { label: 'Certs Expiring <60d', value: expiring60, accent: '#f59e0b', sub: 'Plan renewal now' },
          { label: 'Missing Required',    value: missing,    accent: '#7c3aed', sub: 'Certs not yet held' },
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
          <h3>Training Matrix</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
              <CheckCircle size={11} color="#16a34a" /> Valid
              <Clock size={11} color="#f59e0b" style={{ marginLeft: 4 }} /> Expiring
              <AlertTriangle size={11} color="#dc2626" style={{ marginLeft: 4 }} /> &lt;30d
              <span style={{ color: '#dc2626', fontWeight: 800, marginLeft: 4 }}>✗</span> Missing
            </div>
            <button className="btn-sec"><Download size={13} /> Export</button>
            <button className="btn-pri"><Plus size={13} /> Add Training</button>
          </div>
        </div>
        <div style={{ padding: '8px 18px 4px' }}>
          <div style={{ position: 'relative', maxWidth: 220 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, outline: 'none', boxSizing: 'border-box' }}
              placeholder="Search workers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                {CERT_COLS.map(c => <th key={c.key} style={{ textAlign: 'center' }}>{c.label}</th>)}
                <th style={{ textAlign: 'center' }}>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => {
                const comp = compliance(w);
                return (
                  <tr key={w.name}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{w.name}</td>
                    <td><span className="badge b-gray">{w.role}</span></td>
                    {CERT_COLS.map(c => (
                      <td key={c.key} style={{ textAlign: 'center' }}>
                        <CellIcon status={w.certs[c.key]} required={c.required.includes(w.role)} />
                      </td>
                    ))}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <div style={{ width: 50 }} className="progress-bar">
                          <div className="progress-fill" style={{ width: `${comp}%`, background: comp >= 90 ? '#16a34a' : comp >= 70 ? '#f59e0b' : '#dc2626' }} />
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: comp >= 90 ? '#16a34a' : comp >= 70 ? '#f59e0b' : '#dc2626' }}>{comp}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingTab;
