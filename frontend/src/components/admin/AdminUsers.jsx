/**
 * AdminUsers — user management panel
 * Create users with auto-generated passwords + credentials card
 */

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../../services/api/client';
import {
  UserPlus, RefreshCw, Edit2, KeyRound, UserX, UserCheck,
  Copy, Check, Eye, EyeOff, RotateCcw, ShieldCheck,
} from 'lucide-react';

const ROLES      = ['User', 'Supervisor', 'Admin'];
const FACILITIES = ['Ketchikan', 'Naknek', 'Sitka', 'Valdez', 'Other'];

/* ── Helpers ───────────────────────────────────────────────────────────── */
function generatePassword() {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const special = '@#$!';
  const rand    = (s) => s[Math.floor(Math.random() * s.length)];
  const body    = Array.from({ length: 5 }, () => rand(upper + lower + digits)).join('');
  const pw      = rand(upper) + rand(digits) + rand(special) + body;
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

/* ── Role badge ─────────────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const map = {
    SuperAdmin: 'bg-red-100 text-red-700',
    Admin:      'bg-purple-100 text-purple-700',
    Supervisor: 'bg-yellow-100 text-yellow-700',
    User:       'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[role] || 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  );
};

/* ── Copy button ────────────────────────────────────────────────────────── */
const CopyBtn = ({ text, small }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: small ? '2px 8px' : '4px 10px',
        fontSize: 11, fontWeight: 600,
        background: copied ? '#dcfce7' : '#f1f5f9',
        color: copied ? '#16a34a' : '#475569',
        border: `1px solid ${copied ? '#bbf7d0' : '#cbd5e1'}`,
        borderRadius: 5, cursor: 'pointer', transition: 'all .15s',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

/* ── Credentials card (shown after user creation) ───────────────────────── */
const CredentialsCard = ({ username, password, fullName, onClose }) => {
  const [showPw, setShowPw] = useState(false);
  const block = `Username: ${username}\nTemporary password: ${password}\n\nLogin at: ${window.location.origin}/login`;

  return (
    <div style={{
      background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
      padding: 20, marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <ShieldCheck size={18} color="#16a34a" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#14532d' }}>
            User created — share these credentials
          </div>
          <div style={{ fontSize: 12, color: '#166534', marginTop: 1 }}>
            {fullName || username} must change their password on first login
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        {/* Username row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px' }}>Username</div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#111827', marginTop: 2 }}>{username}</div>
          </div>
          <CopyBtn text={username} small />
        </div>

        {/* Password row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f0fdf4' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px' }}>Temporary Password</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: showPw ? 0 : 3 }}>
                {showPw ? password : '••••••••'}
              </div>
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <CopyBtn text={password} small />
        </div>
      </div>

      {/* Copy full block */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#166534' }}>Copy full credentials block to share</span>
        <CopyBtn text={block} />
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: 14, width: '100%', padding: '9px',
          background: '#16a34a', color: '#fff', border: 'none',
          borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Done — Close
      </button>
    </div>
  );
};

/* ── Create / Edit Modal ────────────────────────────────────────────────── */
const UserFormModal = ({ user, onSave, onClose }) => {
  const isEdit = !!user?.id;

  const [form, setForm] = useState({
    username:   user?.username   || '',
    email:      user?.email      || '',
    full_name:  user?.full_name  || '',
    job_title:  user?.job_title  || '',
    facility:   user?.facility   || '',
    department: user?.department || '',
    role:       user?.role       || 'User',
    password:   isEdit ? '' : generatePassword(),
  });
  const [showPw, setShowPw]   = useState(true); // show generated pw by default
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [created, setCreated] = useState(null); // { username, password, fullName }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await apiClient.put(`/admin/users/${user.id}`, form);
        onSave();
      } else {
        const res = await apiClient.post('/admin/users', form);
        // Show credentials card inline
        setCreated({
          username: form.username,
          password: res.data.temporaryPassword || form.password,
          fullName: form.full_name,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{isEdit ? 'Edit User' : 'Add Team Member'}</div>
            {!isEdit && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>A temporary password will be generated for them</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '20px 22px' }}>
          {/* Credentials card shown after creation */}
          {created && (
            <CredentialsCard
              username={created.username}
              password={created.password}
              fullName={created.fullName}
              onClose={() => { onSave(); onClose(); }}
            />
          )}

          {!created && (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#991b1b' }}>
                  {error}
                </div>
              )}

              {/* Username + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Username *</label>
                  <input
                    required style={inp}
                    value={form.username}
                    onChange={e => set('username', e.target.value)}
                    disabled={isEdit}
                    placeholder="jsmith"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label style={lbl}>Email</label>
                  <input type="email" style={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder="j@company.com" />
                </div>
              </div>

              {/* Full Name + Job Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Full Name</label>
                  <input style={inp} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <label style={lbl}>Job Title</label>
                  <input style={inp} value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="Safety Officer" />
                </div>
              </div>

              {/* Facility + Department */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Facility</label>
                  <select style={inp} value={form.facility} onChange={e => set('facility', e.target.value)}>
                    <option value="">— Select —</option>
                    {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Department</label>
                  <input style={inp} value={form.department} onChange={e => set('department', e.target.value)} placeholder="Production" />
                </div>
              </div>

              {/* Role */}
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Role</label>
                <select style={inp} value={form.role} onChange={e => set('role', e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Password — only on create */}
              {!isEdit && (
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Temporary Password</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        required style={{ ...inp, paddingRight: 36, fontFamily: showPw ? 'monospace' : 'inherit', letterSpacing: showPw ? 1 : 3 }}
                        type={showPw ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => set('password', e.target.value)}
                        minLength={6}
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { set('password', generatePassword()); setShowPw(true); }}
                      title="Generate new password"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', fontSize: 11, fontWeight: 600, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', color: '#475569', whiteSpace: 'nowrap' }}
                    >
                      <RotateCcw size={12} />
                      New
                    </button>
                    <CopyBtn text={form.password} />
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 5 }}>
                    Auto-generated. You can edit or regenerate. Copy it before saving to share with the user.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
                <button type="button" onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 7, background: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', opacity: saving ? .6 : 1 }}>
                  {saving ? 'Creating…' : isEdit ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Reset Password Modal ───────────────────────────────────────────────── */
const ResetPasswordModal = ({ user, onClose }) => {
  const [pw, setPw]       = useState(() => generatePassword());
  const [showPw, setShowPw] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post(`/admin/users/${user.id}/reset-password`, { new_password: pw });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>Reset Password</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 18 }}>@{user.username} · {user.full_name || ''}</div>

        {done ? (
          <>
            <CredentialsCard username={user.username} password={pw} fullName={user.full_name} onClose={onClose} />
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#991b1b' }}>{error}</div>}
            <label style={lbl}>New Password</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  required style={{ ...inp, paddingRight: 36, fontFamily: showPw ? 'monospace' : 'inherit' }}
                  type={showPw ? 'text' : 'password'}
                  value={pw} onChange={e => setPw(e.target.value)} minLength={6}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button type="button" onClick={() => { setPw(generatePassword()); setShowPw(true); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', fontSize: 11, fontWeight: 600, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', color: '#475569' }}>
                <RotateCcw size={12} /> New
              </button>
              <CopyBtn text={pw} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 7, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700, background: '#d97706', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', opacity: saving ? .6 : 1 }}>
                {saving ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── Shared input styles ────────────────────────────────────────────────── */
const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 5 };
const inp = { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 7, padding: '8px 12px', fontSize: 13, color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' };

/* ── Main component ─────────────────────────────────────────────────────── */
const AdminUsers = () => {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState('');
  const [editUser, setEditUser]         = useState(null);
  const [resetUser, setResetUser]       = useState(null);
  const [showCreateModal, setShowCreate] = useState(false);
  const [actionMsg, setActionMsg]       = useState(null);

  const flash = (msg, isError = false) => {
    setActionMsg({ msg, isError });
    setTimeout(() => setActionMsg(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await apiClient.get(`/admin/users${params}`);
      setUsers(res.data);
    } catch (err) {
      flash(err.response?.data?.message || err.message, true);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (u) => {
    const action = u.is_active ? 'Deactivate' : 'Activate';
    if (!window.confirm(`${action} ${u.username}?`)) return;
    try {
      await apiClient.patch(`/admin/users/${u.id}/toggle-active`);
      flash(`User ${action.toLowerCase()}d`);
      load();
    } catch (err) {
      flash(err.response?.data?.message || err.message, true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">{users.length} account{users.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800" title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <UserPlus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Flash message */}
      {actionMsg && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${actionMsg.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {actionMsg.msg}
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search by name, username, or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : users.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-gray-400 text-sm mb-3">No users found</div>
            <button onClick={() => setShowCreate(true)} className="text-blue-600 text-sm font-semibold hover:underline">
              + Add your first team member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['User', 'Facility / Dept', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50 transition ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{u.full_name || u.username}</p>
                      <p className="text-xs text-gray-400">{u.username}{u.email ? ` · ${u.email}` : ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.facility || '—'}
                      {u.department && <span className="text-gray-400"> / {u.department}</span>}
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>
                        {u.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditUser(u)} title="Edit user" className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setResetUser(u)} title="Reset password" className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50 transition">
                          <KeyRound size={14} />
                        </button>
                        <button onClick={() => toggleActive(u)} title={u.is_active ? 'Deactivate' : 'Activate'} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition">
                          {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(editUser || showCreateModal) && (
        <UserFormModal
          user={editUser || null}
          onSave={() => { setEditUser(null); setShowCreate(false); load(); flash('User saved successfully'); }}
          onClose={() => { setEditUser(null); setShowCreate(false); }}
        />
      )}
      {resetUser && (
        <ResetPasswordModal user={resetUser} onClose={() => { setResetUser(null); load(); }} />
      )}
    </div>
  );
};

export default AdminUsers;
