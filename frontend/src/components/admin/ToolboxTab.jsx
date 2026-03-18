/**
 * Toolbox Talks Tab — safety briefings schedule & attendance tracking
 */
import React, { useState } from 'react';
import { Plus, MessageSquare, Users, CheckCircle, Clock, Download } from 'lucide-react';

const TALKS = [
  { id: 'TBT-2024-018', date: '2024-03-14', topic: 'Heat Stress & Hydration',           presenter: 'K. Tanaka',  attended: 17, scheduled: 20, duration: 15, shift: 'Day',       status: 'Done', materials: true  },
  { id: 'TBT-2024-017', date: '2024-03-11', topic: 'Forklift Safety & Pedestrian Zones', presenter: 'M. Flores',  attended: 22, scheduled: 22, duration: 20, shift: 'All',       status: 'Done', materials: true  },
  { id: 'TBT-2024-016', date: '2024-03-07', topic: 'Chemical Handling — H2S Awareness',  presenter: 'S. O\'Brien', attended: 19, scheduled: 20, duration: 25, shift: 'Day',       status: 'Done', materials: true  },
  { id: 'TBT-2024-015', date: '2024-03-04', topic: 'Emergency Evacuation Procedures',    presenter: 'S. O\'Brien', attended: 28, scheduled: 30, duration: 20, shift: 'All',       status: 'Done', materials: false },
  { id: 'TBT-2024-019', date: '2024-03-18', topic: 'Manual Handling & Ergonomics',       presenter: 'C. Davis',   attended: null,scheduled: 18, duration: 15, shift: 'Day',       status: 'Scheduled', materials: false },
  { id: 'TBT-2024-020', date: '2024-03-21', topic: 'Working at Height — Harness Checks', presenter: 'T. Reed',    attended: null,scheduled: 12, duration: 20, shift: 'Afternoon', status: 'Scheduled', materials: false },
  { id: 'TBT-2024-021', date: '2024-03-25', topic: 'PPE Selection & Inspection',         presenter: 'K. Tanaka',  attended: null,scheduled: 25, duration: 15, shift: 'All',       status: 'Scheduled', materials: false },
  { id: 'TBT-2024-022', date: '2024-03-28', topic: 'Incident Reporting & Near Misses',   presenter: 'S. O\'Brien', attended: null,scheduled: 20, duration: 20, shift: 'Day',      status: 'Scheduled', materials: false },
];

const TOPICS_BANK = [
  'Slips, Trips & Falls', 'Confined Space Entry', 'Electrical Safety', 'Fire Prevention',
  'Spill Response', 'Toolbox Safety', 'LOTO Awareness', 'Driving Safety',
  'Fatigue Management', 'Mental Health Awareness', 'Job Hazard Analysis',
];

const STATUSES = ['All Status','Done','Scheduled'];
const SHIFTS   = ['All Shifts','Day','Afternoon','Night','All'];

const ToolboxTab = () => {
  const [status, setStatus] = useState('All Status');
  const [shift, setShift]   = useState('All Shifts');

  const filtered = TALKS.filter(t =>
    (status === 'All Status' || t.status === status) &&
    (shift  === 'All Shifts' || t.shift  === shift)
  );

  const done     = TALKS.filter(t => t.status === 'Done').length;
  const sched    = TALKS.filter(t => t.status === 'Scheduled').length;
  const totalAtt = TALKS.filter(t => t.attended).reduce((s, t) => s + t.attended, 0);
  const totalSch = TALKS.filter(t => t.attended).reduce((s, t) => s + t.scheduled, 0);
  const avgAtt   = Math.round((totalAtt / totalSch) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Completed MTD',    value: done,    accent: '#16a34a', sub: `${TALKS.length} total this month` },
          { label: 'Scheduled',        value: sched,   accent: '#2563eb', sub: 'Upcoming talks' },
          { label: 'Total Attendees',  value: totalAtt,accent: '#7c3aed', sub: 'This month to date' },
          { label: 'Avg Attendance',   value: `${avgAtt}%`, accent: avgAtt >= 90 ? '#16a34a' : '#ea580c', sub: 'vs. scheduled' },
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
        {/* Upcoming next talk highlight */}
        <div className="acard">
          <div className="ch"><h3>Next Scheduled Talk</h3></div>
          {(() => {
            const next = TALKS.find(t => t.status === 'Scheduled');
            if (!next) return <div style={{ padding: 18, color: '#94a3b8' }}>No upcoming talks scheduled</div>;
            return (
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageSquare size={22} color="#7c3aed" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{next.topic}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {next.date} · {next.duration} min · {next.shift} shift
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Presenter: {next.presenter}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 12.5, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>EXPECTED ATTENDEES</div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16 }}>{next.scheduled}</div>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>DURATION</div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16 }}>{next.duration} min</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-pri" style={{ flex: 1, justifyContent: 'center' }}>Start Talk</button>
                  <button className="btn-sec"><Download size={13} /></button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Topic bank */}
        <div className="acard">
          <div className="ch"><h3>Topic Bank</h3></div>
          <div style={{ padding: '10px 18px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TOPICS_BANK.map(t => (
              <span key={t} className="badge b-gray" style={{ cursor: 'pointer', padding: '4px 10px' }} title="Click to schedule">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full list */}
      <div className="acard">
        <div className="ch">
          <h3>Talk Register</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
              value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(o => <option key={o}>{o}</option>)}
            </select>
            <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
              value={shift} onChange={e => setShift(e.target.value)}>
              {SHIFTS.map(o => <option key={o}>{o}</option>)}
            </select>
            <button className="btn-pri"><Plus size={13} /> Schedule Talk</button>
          </div>
        </div>

        {filtered.map(t => {
          const attPct = t.attended ? Math.round((t.attended / t.scheduled) * 100) : null;
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '0.5px solid #f8fafc' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: t.status === 'Done' ? '#dcfce7' : '#dbeafe', flexShrink: 0 }}>
                {t.status === 'Done' ? <CheckCircle size={18} color="#16a34a" /> : <Clock size={18} color="#2563eb" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#7c3aed' }}>{t.id}</span>
                  <span className="badge b-gray">{t.shift} shift</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{t.topic}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {t.date} · {t.duration} min · Presenter: {t.presenter}
                </div>
                {t.attended !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Users size={11} color="#94a3b8" />
                    <span style={{ fontSize: 11.5, color: '#64748b' }}>{t.attended}/{t.scheduled} attended</span>
                    <div className="progress-bar" style={{ width: 60, marginTop: 0 }}>
                      <div className="progress-fill" style={{ width: `${attPct}%`, background: attPct >= 90 ? '#16a34a' : '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: attPct >= 90 ? '#16a34a' : '#f59e0b' }}>{attPct}%</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className={`badge ${t.status === 'Done' ? 'b-green' : 'b-blue'}`}>{t.status}</span>
                {t.status === 'Done' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {t.materials && <button className="mini-btn"><Download size={10} /> Materials</button>}
                    <button className="mini-btn">Attendance</button>
                  </div>
                )}
                {t.status === 'Scheduled' && <button className="mini-btn green">Start</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolboxTab;
