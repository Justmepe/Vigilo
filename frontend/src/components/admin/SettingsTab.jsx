import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api/client';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#64748b', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
      {title}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', placeholder, full, hint }) => (
  <div style={full ? { gridColumn: '1 / -1' } : {}}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }}
      />
    )}
    {hint && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{hint}</div>}
  </div>
);

const ColorField = ({ label, name, value, onChange }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="color"
        name={name}
        value={value || '#0d1f35'}
        onChange={onChange}
        style={{ width: 44, height: 36, border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', padding: 2 }}
      />
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder="#0d1f35"
        style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}
      />
    </div>
  </div>
);

const DEFAULTS = {
  company_name: '', company_logo_url: '', primary_color: '#0d1f35', accent_color: '#c9943a',
  contact_name: '', contact_email: '', contact_phone: '', physical_address: '',
  report_footer: '', report_header_note: '',
  industry: '', site_location: '', safety_officer: '', emergency_number: '',
};

const SettingsTab = () => {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    apiClient.get('/admin/settings')
      .then(r => setForm({ ...DEFAULTS, ...r.data.data }))
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load settings' }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setStatus(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await apiClient.put('/admin/settings', form);
      setStatus({ type: 'success', msg: 'Settings saved successfully.' });
    } catch {
      setStatus({ type: 'error', msg: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading settings…</div>;

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 820 }}>

      {status && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13,
          background: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: status.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {status.msg}
        </div>
      )}

      <Section title="Company Branding">
        <Field label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} placeholder="Vigilo EHS Ltd." />
        <Field label="Industry" name="industry" value={form.industry} onChange={handleChange} placeholder="Food Manufacturing" />
        <Field label="Logo URL" name="company_logo_url" value={form.company_logo_url} onChange={handleChange} placeholder="https://…/logo.png" hint="Paste a public image URL. Appears on exported reports." full />
        <ColorField label="Primary Colour" name="primary_color" value={form.primary_color} onChange={handleChange} />
        <ColorField label="Accent Colour" name="accent_color" value={form.accent_color} onChange={handleChange} />
      </Section>

      <Section title="Site & Operations">
        <Field label="Site / Facility Location" name="site_location" value={form.site_location} onChange={handleChange} placeholder="Plant 1 — Auckland, NZ" />
        <Field label="Safety Officer" name="safety_officer" value={form.safety_officer} onChange={handleChange} placeholder="Jane Smith" />
        <Field label="Emergency Number" name="emergency_number" value={form.emergency_number} onChange={handleChange} placeholder="0800 111 000" />
        <Field label="Physical Address" name="physical_address" value={form.physical_address} onChange={handleChange} placeholder="123 Safety St, Auckland" />
      </Section>

      <Section title="Contact Information">
        <Field label="Primary Contact Name" name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="John Doe" />
        <Field label="Contact Email" name="contact_email" value={form.contact_email} onChange={handleChange} type="email" placeholder="safety@company.com" />
        <Field label="Contact Phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="+64 9 123 4567" />
      </Section>

      <Section title="Report Templates">
        <Field
          label="Report Header Note"
          name="report_header_note"
          value={form.report_header_note}
          onChange={handleChange}
          type="textarea"
          placeholder="Confidential — for internal use only."
          full
        />
        <Field
          label="Report Footer Text"
          name="report_footer"
          value={form.report_footer}
          onChange={handleChange}
          type="textarea"
          placeholder="© 2026 Vigilo EHS. All safety records must be retained for 7 years."
          hint="Appears at the bottom of every exported PDF/Word document."
          full
        />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? '#9ca3af' : 'linear-gradient(135deg, #0d1f35, #1e3a5f)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsTab;
