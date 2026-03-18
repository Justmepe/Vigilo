/**
 * Workers on Site Tab — shift roster, check-in log, PPE compliance
 */
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const SHIFTS = [
  {
    name: 'Day Shift', time: '06:00 – 14:00', supervisor: 'M. Flores',
    workers: [
      { name: 'J. Williams', role: 'Line Lead',   area: 'Processing Line 1', checkin: '05:52', ppe: true,  status: 'On Site'  },
      { name: 'C. Davis',    role: 'Operator',    area: 'Processing Line 1', checkin: '05:58', ppe: true,  status: 'On Site'  },
      { name: 'R. Singh',    role: 'Operator',    area: 'Processing Line 2', checkin: '06:05', ppe: false, status: 'On Site'  },
      { name: 'L. Nguyen',   role: 'Line Lead',   area: 'Processing Line 2', checkin: '05:55', ppe: true,  status: 'On Site'  },
      { name: 'P. Mwangi',   role: 'Operator',    area: 'Warehouse',         checkin: '06:10', ppe: true,  status: 'On Site'  },
      { name: 'B. Walsh',    role: 'Maintenance', area: 'Processing Area',   checkin: '07:30', ppe: true,  status: 'On Site'  },
    ],
  },
  {
    name: 'Afternoon Shift', time: '14:00 – 22:00', supervisor: 'T. Reed',
    workers: [
      { name: 'K. Tanaka',   role: 'EHS Officer', area: 'All Areas',         checkin: '13:45', ppe: true,  status: 'On Site'  },
      { name: 'A. Petrov',   role: 'Operator',    area: 'Processing Line 1', checkin: null,    ppe: null,  status: 'Expected' },
      { name: 'D. Kim',      role: 'Operator',    area: 'Processing Line 2', checkin: null,    ppe: null,  status: 'Expected' },
    ],
  },
  {
    name: 'Night Shift', time: '22:00 – 06:00', supervisor: 'S. O\'Brien',
    workers: [
      { name: 'F. Okafor',   role: 'Operator',    area: 'Processing Line 1', checkin: null,    ppe: null,  status: 'Scheduled'},
      { name: 'G. Bravo',    role: 'Operator',    area: 'Warehouse',         checkin: null,    ppe: null,  status: 'Scheduled'},
    ],
  },
];

const VISITORS = [
  { name: 'Dr. I. Park',     company: 'WorkSafe Inspector', purpose: 'Annual compliance audit', checkin: '09:00', checkout: null,    host: 'S. O\'Brien', badge: 'V-041' },
  { name: 'J. Carter',       company: 'HVAC Solutions Ltd', purpose: 'Maintenance contract',    checkin: '07:30', checkout: '11:45', host: 'T. Reed',     badge: 'V-040' },
];

const STATUS_COLOR = { 'On Site': '#16a34a', 'Expected': '#f59e0b', 'Scheduled': '#2563eb' };

const WorkersTab = () => {
  const [activeShift, setActiveShift] = useState(0);
  const shift = SHIFTS[activeShift];
  const onSite = SHIFTS.flatMap(s => s.workers).filter(w => w.status === 'On Site').length;
  const total  = SHIFTS.flatMap(s => s.workers).length + VISITORS.length;
  const noPPE  = SHIFTS.flatMap(s => s.workers).filter(w => w.status === 'On Site' && w.ppe === false).length;
  const ppeComp = Math.round((SHIFTS.flatMap(s => s.workers).filter(w => w.status === 'On Site' && w.ppe === true).length /
    Math.max(1, SHIFTS.flatMap(s => s.workers).filter(w => w.status === 'On Site').length)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Currently on Site', value: onSite,   accent: '#16a34a', sub: `${total} total incl. expected` },
          { label: 'Active Shifts',     value: SHIFTS.length, accent: '#2563eb', sub: '3 shifts today' },
          { label: 'PPE Compliance',    value: `${ppeComp}%`, accent: ppeComp === 100 ? '#16a34a' : '#ea580c', sub: 'Checked workers' },
          { label: 'PPE Non-Compliance',value: noPPE,    accent: '#dc2626', sub: 'Workers without PPE' },
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
              {SHIFTS.map((s, i) => (
                <button key={i} className={`mini-btn${activeShift === i ? ' green' : ''}`} onClick={() => setActiveShift(i)}>
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 18px', borderBottom: '0.5px solid #f1f5f9' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{shift.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{shift.time} · Supervisor: {shift.supervisor}</div>
          </div>
          {shift.workers.map((w, i) => (
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
        </div>

        {/* Visitors + site summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Site total visual */}
          <div className="acard" style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Site Headcount</div>
            {SHIFTS.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: '#475569' }}>{s.name}</span>
                  <span style={{ fontWeight: 700 }}>{s.workers.filter(w => w.status === 'On Site').length}/{s.workers.length}</span>
                </div>
                <div className="progress-bar" style={{ marginTop: 0 }}>
                  <div className="progress-fill" style={{
                    width: `${Math.round(s.workers.filter(w=>w.status==='On Site').length/s.workers.length*100)}%`,
                    background: '#2563eb',
                  }} />
                </div>
              </div>
            ))}
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
