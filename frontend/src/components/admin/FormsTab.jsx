/**
 * FormsTab — Submit safety forms from within the EHS Command Center
 * Shows a grouped form selector grid; clicking a form renders it inline.
 */

import React, { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { FORM_REGISTRY, getFormsByCategory } from '../forms/FormRegistry';

const CATEGORY_COLORS = {
  'Safety Analysis':    { bg: '#dbeafe', accent: '#1d4ed8', badge: '#eff6ff' },
  'Safety Procedures':  { bg: '#fef3c7', accent: '#b45309', badge: '#fffbeb' },
  'Incident Reporting': { bg: '#fee2e2', accent: '#dc2626', badge: '#fef2f2' },
  'Environmental':      { bg: '#ccfbf1', accent: '#0d9488', badge: '#f0fdfa' },
  'Compliance':         { bg: '#dcfce7', accent: '#16a34a', badge: '#f0fdf4' },
};

const FormsTab = () => {
  const [selected, setSelected] = useState(null); // form key or null
  const grouped = getFormsByCategory();

  if (selected) {
    const formCfg = FORM_REGISTRY[selected];
    if (!formCfg) return null;
    const FormComponent = formCfg.component;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
        {/* Back bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
        }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f1f5f9', border: 'none', borderRadius: 6,
              padding: '6px 14px', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, color: '#475569',
            }}
          >
            <ArrowLeft size={14} />
            All Forms
          </button>
          <span style={{ color: '#cbd5e1' }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{formCfg.name}</span>
        </div>

        {/* Form content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <FormComponent />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          Submit a Safety Form
        </h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Select a form below to fill and submit. Completed forms are saved and synced automatically.
        </p>
      </div>

      {Object.entries(grouped).map(([category, forms]) => {
        const palette = CATEGORY_COLORS[category] || { bg: '#f1f5f9', accent: '#475569', badge: '#f8fafc' };
        return (
          <div key={category} style={{ marginBottom: 32 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            }}>
              <div style={{
                width: 4, height: 18, borderRadius: 2, background: palette.accent,
              }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: palette.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {category}
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {forms.map((formCfg) => {
                const IconComponent = formCfg.icon;
                return (
                  <button
                    key={formCfg.id}
                    onClick={() => setSelected(formCfg.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      background: '#fff', border: '1px solid #e2e8f0',
                      borderRadius: 10, padding: '16px 18px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'box-shadow 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = palette.accent;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: palette.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComponent size={20} color={palette.accent} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13.5, fontWeight: 700, color: '#0f172a',
                        marginBottom: 4, lineHeight: 1.3,
                      }}>
                        {formCfg.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                        {formCfg.description}
                      </div>
                      {formCfg.enhanced && (
                        <span style={{
                          display: 'inline-block', marginTop: 6,
                          background: palette.badge, color: palette.accent,
                          fontSize: 10, fontWeight: 700, padding: '2px 7px',
                          borderRadius: 4, border: `1px solid ${palette.accent}22`,
                        }}>
                          ENHANCED
                        </span>
                      )}
                    </div>
                    <ChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FormsTab;
