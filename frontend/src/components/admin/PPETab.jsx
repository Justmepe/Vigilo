/**
 * PPE Tracker Tab — inventory levels, stock vs minimum, compliance %
 */
import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import apiClient from '../../services/api/client';

const CATS = ['All Categories','Head','Eye','Eye/Face','Gas','Respiratory','Hand','Foot','Visibility','Fall Arrest','Hearing','Body'];

const PPETab = () => {
  const [inventory, setInventory] = useState([]);
  const [counts, setCounts]       = useState({ total: 0, low_stock: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [cat, setCat]             = useState('All Categories');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/ehs/ppe');
        if (res.data.success) {
          setInventory(res.data.data);
          setCounts(res.data.counts);
        }
      } catch (err) {
        setError('Failed to load PPE inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = inventory.filter(i => cat === 'All Categories' || i.category === cat);

  const lowStockItems = inventory.filter(i => i.low_stock);
  const critical      = inventory.filter(i => i.stock < i.min * 0.5).length;
  const avgComp       = inventory.length ? Math.round(inventory.reduce((s, i) => s + i.compliance, 0) / inventory.length) : 0;

  const stockPct = (i) => Math.min(Math.round((i.stock / (i.min * 2)) * 100), 100);

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sg4">
        {[
          { label: 'Total PPE Items',    value: counts.total,    accent: '#2563eb', sub: 'Categories tracked' },
          { label: 'Low Stock Items',    value: counts.low_stock, accent: '#ea580c', sub: 'Below minimum level' },
          { label: 'Critical Low',       value: critical,         accent: '#dc2626', sub: '<50% of minimum' },
          { label: 'Avg Compliance',     value: `${avgComp}%`,   accent: '#16a34a', sub: 'Worker usage rate' },
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
            <span className="badge b-red">{lowStockItems.length} Items</span>
          </div>
          {lowStockItems.map(i => (
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
          {lowStockItems.length === 0 && <div style={{ padding: 18, textAlign: 'center', color: '#16a34a', fontSize: 12.5 }}>All items above minimum stock levels ✓</div>}
        </div>

        {/* Compliance by category */}
        <div className="acard">
          <div className="ch"><h3>Compliance by Category</h3></div>
          {['Head','Eye','Respiratory','Hand','Foot','Visibility','Fall Arrest','Hearing'].map(c => {
            const items = inventory.filter(i => i.category === c);
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
                const low = i.low_stock;
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
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No PPE items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PPETab;
