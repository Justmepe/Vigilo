/**
 * PPE Tracker Tab — inventory levels, stock vs minimum, compliance %
 */
import React, { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';

const INVENTORY = [
  { item: 'Hard Hat (Class E)',          category: 'Head',        stock: 48, min: 20, unit: 'ea',  condition: 'Good',   compliance: 98, lastAudit: '2024-03-10', location: 'PPE Store A' },
  { item: 'Safety Glasses (Clear)',      category: 'Eye',         stock: 32, min: 30, unit: 'ea',  condition: 'Good',   compliance: 95, lastAudit: '2024-03-10', location: 'PPE Store A' },
  { item: 'Safety Glasses (Tinted)',     category: 'Eye',         stock: 8,  min: 15, unit: 'ea',  condition: 'Good',   compliance: 95, lastAudit: '2024-03-10', location: 'PPE Store A' },
  { item: 'Face Shield',                 category: 'Eye/Face',    stock: 6,  min: 8,  unit: 'ea',  condition: 'Good',   compliance: 90, lastAudit: '2024-03-10', location: 'PPE Store B' },
  { item: 'H2S Detector (Personal)',     category: 'Gas',         stock: 12, min: 15, unit: 'ea',  condition: 'Fair',   compliance: 82, lastAudit: '2024-03-08', location: 'Safety Office' },
  { item: 'Half-Face Respirator P100',   category: 'Respiratory', stock: 18, min: 10, unit: 'ea',  condition: 'Good',   compliance: 94, lastAudit: '2024-03-10', location: 'PPE Store B' },
  { item: 'Filter Cartridges OV/P100',   category: 'Respiratory', stock: 24, min: 30, unit: 'pairs', condition: 'Good', compliance: 94, lastAudit: '2024-03-10', location: 'PPE Store B' },
  { item: 'Nitrile Gloves (M)',          category: 'Hand',        stock: 200,min: 100,unit: 'pairs', condition: 'Good', compliance: 99, lastAudit: '2024-03-12', location: 'PPE Store A' },
  { item: 'Cut-Resistant Gloves (L)',    category: 'Hand',        stock: 14, min: 20, unit: 'pairs', condition: 'Good', compliance: 91, lastAudit: '2024-03-12', location: 'PPE Store A' },
  { item: 'Safety Boots (Steel Toe)',    category: 'Foot',        stock: 10, min: 10, unit: 'pairs', condition: 'Good', compliance: 97, lastAudit: '2024-03-10', location: 'PPE Store A' },
  { item: 'Hi-Vis Vest (Class 2)',       category: 'Visibility',  stock: 55, min: 40, unit: 'ea',  condition: 'Good',   compliance: 100,lastAudit: '2024-03-12', location: 'PPE Store A' },
  { item: 'Full Body Harness',           category: 'Fall Arrest', stock: 8,  min: 6,  unit: 'ea',  condition: 'Good',   compliance: 88, lastAudit: '2024-03-05', location: 'PPE Store B' },
  { item: 'Hearing Protection (Plug)',   category: 'Hearing',     stock: 500,min: 200,unit: 'pairs', condition: 'Good', compliance: 93, lastAudit: '2024-03-12', location: 'PPE Store A' },
  { item: 'Chemical Splash Suit',        category: 'Body',        stock: 3,  min: 5,  unit: 'ea',  condition: 'Good',   compliance: 86, lastAudit: '2024-03-10', location: 'PPE Store B' },
];

const CATS = ['All Categories','Head','Eye','Eye/Face','Gas','Respiratory','Hand','Foot','Visibility','Fall Arrest','Hearing','Body'];

const PPETab = () => {
  const [cat, setCat] = useState('All Categories');

  const filtered = INVENTORY.filter(i => cat === 'All Categories' || i.category === cat);

  const lowStock  = INVENTORY.filter(i => i.stock < i.min).length;
  const critical  = INVENTORY.filter(i => i.stock < i.min * 0.5).length;
  const totalItems = INVENTORY.length;
  const avgComp   = Math.round(INVENTORY.reduce((s, i) => s + i.compliance, 0) / INVENTORY.length);

  const stockPct = (i) => Math.min(Math.round((i.stock / (i.min * 2)) * 100), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Total PPE Items',    value: totalItems, accent: '#2563eb', sub: 'Categories tracked' },
          { label: 'Low Stock Items',    value: lowStock,   accent: '#ea580c', sub: 'Below minimum level' },
          { label: 'Critical Low',       value: critical,   accent: '#dc2626', sub: '<50% of minimum' },
          { label: 'Avg Compliance',     value: `${avgComp}%`, accent: '#16a34a', sub: 'Worker usage rate' },
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
        {/* Low stock alerts */}
        <div className="acard">
          <div className="ch">
            <h3>Low Stock Alerts</h3>
            <span className="badge b-red">{lowStock} Items</span>
          </div>
          {INVENTORY.filter(i => i.stock < i.min).map(i => (
            <div key={i.item} className="arow">
              <div className="row-icon" style={{ background: '#fee2e2' }}>
                <AlertTriangle size={15} color="#dc2626" />
              </div>
              <div className="row-main">
                <div className="row-title">{i.item}</div>
                <div className="row-meta">{i.category} · {i.location}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>{i.stock}<span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>/{i.min}</span></div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>stock/min</div>
              </div>
            </div>
          ))}
          {lowStock === 0 && <div style={{ padding: 18, textAlign: 'center', color: '#16a34a', fontSize: 12.5 }}>All items above minimum stock levels ✓</div>}
        </div>

        {/* Compliance by category */}
        <div className="acard">
          <div className="ch"><h3>Compliance by Category</h3></div>
          {['Head','Eye','Respiratory','Hand','Foot','Visibility','Fall Arrest','Hearing'].map(c => {
            const items = INVENTORY.filter(i => i.category === c);
            if (!items.length) return null;
            const avg = Math.round(items.reduce((s, i) => s + i.compliance, 0) / items.length);
            return (
              <div key={c} style={{ padding: '8px 18px', borderBottom: '0.5px solid #f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12.5 }}>
                  <span style={{ color: '#1e293b' }}>{c}</span>
                  <span style={{ fontWeight: 700, color: avg >= 90 ? '#16a34a' : avg >= 70 ? '#f59e0b' : '#dc2626' }}>{avg}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${avg}%`, background: avg >= 90 ? '#16a34a' : avg >= 70 ? '#f59e0b' : '#dc2626' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full inventory */}
      <div className="acard">
        <div className="ch">
          <h3>PPE Inventory</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ fontSize: 12, border: '0.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', background: '#fff' }}
              value={cat} onChange={e => setCat(e.target.value)}>
              {CATS.map(o => <option key={o}>{o}</option>)}
            </select>
            <button className="btn-pri"><Plus size={13} /> Add Item</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Item</th><th>Category</th><th>Stock</th><th>Min</th><th>Level</th><th>Compliance</th><th>Condition</th><th>Last Audit</th><th>Location</th></tr>
            </thead>
            <tbody>
              {filtered.map(i => {
                const pct = stockPct(i);
                const low = i.stock < i.min;
                return (
                  <tr key={i.item}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{i.item}</td>
                    <td><span className="badge b-blue">{i.category}</span></td>
                    <td style={{ fontWeight: 700, color: low ? '#dc2626' : '#16a34a' }}>{i.stock} {i.unit}</td>
                    <td style={{ color: '#64748b' }}>{i.min}</td>
                    <td style={{ minWidth: 100 }}>
                      <div className="progress-bar" style={{ marginTop: 0 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: low ? '#dc2626' : '#16a34a' }} />
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 700, color: i.compliance >= 90 ? '#16a34a' : '#f59e0b' }}>{i.compliance}%</span></td>
                    <td><span className={`badge ${i.condition === 'Good' ? 'b-green' : 'b-amber'}`}>{i.condition}</span></td>
                    <td style={{ fontSize: 11.5 }}>{i.lastAudit}</td>
                    <td style={{ fontSize: 11.5 }}>{i.location}</td>
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

export default PPETab;
