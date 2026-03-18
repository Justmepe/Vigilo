import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RegisterPage.css';

/* ── Inline SVG components ────────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" stroke="#0d1f35" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CheckIcon = ({ size = 8 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const SpinIcon = () => (
  <svg className="vr-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const SuccessCheckIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" stroke="#16a34a" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ── Constants ─────────────────────────────────────────────────────────── */
const INDUSTRIES = [
  'Food Processing', 'Seafood Processing', 'Chemical', 'Pharmaceutical',
  'Manufacturing', 'Oil & Gas', 'Logistics', 'Construction', 'Mining', 'Other',
];

const PW_COLORS = ['#e2ddd4', '#ef4444', '#f59e0b', '#3b82f6', '#16a34a'];
const PW_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function pwStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

/* ── Main Component ─────────────────────────────────────────────────────── */
const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company_name: '', company_industry: '', site_location: '', contact_email: '',
    first_name: '', last_name: '', job_title: '', username: '', login_email: '',
    password: '', confirmPassword: '',
  });
  const [showPw, setShowPw]         = useState(false);
  const [showCpw, setShowCpw]       = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  /* ── Dynamic step progress ── */
  const c1Done = !!(form.company_name && form.company_industry && form.site_location && form.contact_email);
  const c2Done = !!(form.first_name && form.last_name && form.job_title && form.username && form.login_email && form.password && form.confirmPassword);
  const stepIdx = c1Done ? (c2Done ? 2 : 1) : 0;

  const stepCircle = useCallback((i) => {
    if (i < stepIdx) return 'vr-step-circle done';
    if (i === stepIdx) return 'vr-step-circle active';
    return 'vr-step-circle';
  }, [stepIdx]);

  const stepLbl = useCallback((i) => {
    if (i < stepIdx) return 'vr-step-lbl done';
    if (i === stepIdx) return 'vr-step-lbl active';
    return 'vr-step-lbl';
  }, [stepIdx]);

  /* ── Password strength ── */
  const pwStr   = pwStrength(form.password);
  const pwColor = PW_COLORS[pwStr];
  const pwLabel = PW_LABELS[pwStr];
  const pwsMatch = form.confirmPassword && form.password === form.confirmPassword;
  const pwsMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  /* ── Validation ── */
  const validate = () => {
    const fail = (msg) => { setError(msg); return false; };
    if (!form.company_name.trim())     return fail('Company name is required.');
    if (!form.company_industry)        return fail('Please select your industry.');
    if (!form.site_location.trim())    return fail('Primary site / facility name is required.');
    if (!form.contact_email.trim())    return fail('Company contact email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) return fail('Please enter a valid company contact email.');
    if (!form.first_name.trim())       return fail('First name is required.');
    if (!form.last_name.trim())        return fail('Last name is required.');
    if (!form.job_title.trim())        return fail('Job title is required.');
    if (!form.username.trim())         return fail('Username is required.');
    if (form.username.length < 3)      return fail('Username must be at least 3 characters.');
    if (!form.login_email.trim())      return fail('Login email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.login_email)) return fail('Please enter a valid login email.');
    if (!form.password)                return fail('Password is required.');
    if (form.password.length < 6)      return fail('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return fail('Passwords do not match.');
    return true;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = {
        company_name:     form.company_name,
        company_industry: form.company_industry,
        site_location:    form.site_location,
        // contact_email becomes the company's contact email (used for licence mgmt)
        // login_email becomes the user's personal email (login credential)
        email:            form.login_email,
        full_name:        `${form.first_name.trim()} ${form.last_name.trim()}`,
        job_title:        form.job_title,
        username:         form.username,
        password:         form.password,
      };
      const response = await api.post('/auth/register', payload);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setSuccess(true);
        setTimeout(() => navigate('/admin'), 2400);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="vigilo-reg">
      <div className="vr-shell">

        {/* ══ LEFT PANEL ══ */}
        <aside className="vr-left">
          <div className="vr-grid-bg" />
          <div className="vr-glow" />
          <div className="vr-ring" style={{ width: 440, height: 440, top: -130, right: -130 }} />
          <div className="vr-ring" style={{ width: 680, height: 680, top: -260, right: -260 }} />

          <div className="vr-inner">
            {/* Logo */}
            <div className="vr-logo">
              <div className="vr-logo-box"><ShieldIcon /></div>
              <div>
                <div className="vr-logo-name">Vigilo</div>
                <div className="vr-logo-sub">I Watch Over</div>
              </div>
            </div>

            <h2 className="vr-headline">
              One registration.<br />
              <em>Your entire company</em><br />
              under one roof.
            </h2>
            <p className="vr-desc">
              Registering creates a fully isolated tenant workspace for your company. You become the Super Admin — everyone else you invite from inside the portal.
            </p>

            {/* Architecture diagram */}
            <div className="vr-arch">
              <div className="vr-arch-title">Multi-tenant architecture</div>
              <div className="vr-arch-row">
                <div className="vr-arch-dot plat" />
                <div className="vr-arch-lbl">Vigilo Platform <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 10.5 }}>(all tenants)</span></div>
              </div>
              <div className="vr-arch-line" />
              <div className="vr-arch-row vr-arch-i1">
                <div className="vr-arch-dot co" />
                <div className="vr-arch-lbl"><strong>Your Company Workspace</strong><span className="vr-arch-tag green">created now</span></div>
              </div>
              <div className="vr-arch-line" style={{ marginLeft: 21 }} />
              <div className="vr-arch-row vr-arch-i2">
                <div className="vr-arch-dot sa" />
                <div className="vr-arch-lbl you">You — Super Admin<span className="vr-arch-tag gold">that&apos;s you</span></div>
              </div>
              <div className="vr-arch-row vr-arch-i2" style={{ marginTop: 5 }}>
                <div className="vr-arch-dot usr" />
                <div className="vr-arch-lbl dim">Safety Officers, Supervisors, Workers… (you invite)</div>
              </div>
              <div className="vr-arch-row vr-arch-i1" style={{ marginTop: 8, opacity: .35 }}>
                <div className="vr-arch-dot co" />
                <div className="vr-arch-lbl dim">Other companies — fully isolated from yours</div>
              </div>
            </div>

            {/* Rules */}
            <div className="vr-rules">
              {[
                ['All data scoped to your company', ' — forms, reports, incidents, users'],
                ['You invite your team', ' — they never register, you add them from the admin portal'],
                ['Zero data leaks', ' — other Vigilo tenants cannot see your workspace'],
                ['Platform Admin manages licences', ' — suspend or terminate from the Vigilo console'],
              ].map(([bold, rest]) => (
                <div key={bold} className="vr-rule">
                  <div className="vr-rule-tick"><CheckIcon /></div>
                  <div className="vr-rule-text"><strong>{bold}</strong>{rest}</div>
                </div>
              ))}
            </div>

            <p className="vr-copy">© 2026 Vigilo EHS. All rights reserved.</p>
          </div>
        </aside>

        {/* ══ RIGHT PANEL ══ */}
        <main className="vr-right">
          <div className="vr-form-wrap">
            <h1 className="vr-pg-title">Create company workspace</h1>
            <p className="vr-pg-sub">
              This registers <strong>your company as a new tenant</strong> on Vigilo. You&apos;ll be assigned as Super Admin — your team members are invited by you after setup.
            </p>

            {/* Tenant notice */}
            <div className="vr-notice">
              <div className="vr-notice-icon"><BuildingIcon /></div>
              <div>
                <div className="vr-notice-title">You&apos;re creating a new company tenant</div>
                <div className="vr-notice-body">
                  You&apos;ll be the <strong>Super Admin</strong> for your organisation. After setup you can invite teammates, assign roles (Admin, Supervisor, Worker), and manage all EHS documentation. Each company is <strong>fully isolated</strong> — no data shared across tenants.
                </div>
              </div>
            </div>

            {/* Step progress */}
            <div className="vr-steps">
              {['Company', 'Your Account', 'Done'].map((lbl, i) => (
                <React.Fragment key={lbl}>
                  <div className="vr-step-node">
                    <div className={stepCircle(i)}>
                      {i < stepIdx ? <CheckIcon size={11} /> : i + 1}
                    </div>
                    <div className={stepLbl(i)}>{lbl}</div>
                  </div>
                  {i < 2 && <div className={`vr-step-line${i < stepIdx ? ' done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="vr-error">
                <AlertIcon /><span>{error}</span>
              </div>
            )}

            {/* ── SUCCESS STATE ── */}
            {success ? (
              <div className="vr-success-card">
                <div className="vr-success-icon"><SuccessCheckIcon /></div>
                <div className="vr-success-title">Workspace created!</div>
                <p className="vr-success-desc">
                  Your company is now a live tenant on Vigilo. You&apos;re the Super Admin.<br />
                  Redirecting to your admin portal…
                </p>
                <div className="vr-ts-box">
                  {[
                    ['Company', form.company_name],
                    ['Industry', form.company_industry],
                    ['Super Admin', `${form.first_name} ${form.last_name} (@${form.username})`],
                    ['Role', 'Super Admin — full control of your workspace'],
                    ['Next step', 'Invite your team from the Users section in the admin portal'],
                  ].map(([k, v]) => (
                    <div key={k} className="vr-ts-row">
                      <div className="vr-ts-dot" />
                      <div className="vr-ts-text"><strong>{k}:</strong> {v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>

                {/* ── Section 1: Company ── */}
                <div className="vr-section">
                  <div className="vr-sec-head">
                    <div className="vr-sec-icon"><BuildingIcon /></div>
                    <div>
                      <div className="vr-sec-title">Company information</div>
                      <div className="vr-sec-sub">Creates your isolated tenant on Vigilo</div>
                    </div>
                    <div className="vr-sec-step">Step 1 of 2</div>
                  </div>

                  <div className="vr-field">
                    <label className="vr-label" htmlFor="company_name">Company / Organisation Name<span className="vr-req">*</span></label>
                    <input className="vr-input" id="company_name" type="text" value={form.company_name} onChange={set('company_name')} placeholder="e.g. Acme Processing Co." autoComplete="organization" disabled={isLoading} required />
                  </div>

                  <div className="vr-field">
                    <label className="vr-label" htmlFor="company_industry">Industry<span className="vr-req">*</span></label>
                    <select className="vr-input vr-select" id="company_industry" value={form.company_industry} onChange={set('company_industry')} disabled={isLoading} required>
                      <option value="">— Select your industry —</option>
                      {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                  </div>

                  <div className="vr-field">
                    <label className="vr-label" htmlFor="site_location">Primary Site / Facility Name<span className="vr-req">*</span></label>
                    <input className="vr-input" id="site_location" type="text" value={form.site_location} onChange={set('site_location')} placeholder="e.g. Kodiak Processing Plant" disabled={isLoading} required />
                    <div className="vr-hint">The main facility this workspace is set up for. More sites can be added later.</div>
                  </div>

                  <div className="vr-field">
                    <label className="vr-label" htmlFor="contact_email">Company Contact Email<span className="vr-req">*</span></label>
                    <input className="vr-input" id="contact_email" type="email" value={form.contact_email} onChange={set('contact_email')} placeholder="safety@yourcompany.com" autoComplete="off" disabled={isLoading} required />
                    <div className="vr-hint">Used for licence management. Must be unique per company on the platform.</div>
                  </div>
                </div>

                {/* ── Section 2: Super Admin ── */}
                <div className="vr-section">
                  <div className="vr-sec-head">
                    <div className="vr-sec-icon"><UserIcon /></div>
                    <div>
                      <div className="vr-sec-title">Super Admin account</div>
                      <div className="vr-sec-sub">Your personal login — controls your company workspace</div>
                    </div>
                    <div className="vr-sec-step">Step 2 of 2</div>
                  </div>

                  <div className="vr-role-badge">
                    <div className="vr-rb-dot" />
                    <div className="vr-rb-text">Role assigned on registration: Super Admin</div>
                  </div>

                  {/* First + Last */}
                  <div className="vr-frow">
                    <div className="vr-field">
                      <label className="vr-label" htmlFor="first_name">First Name<span className="vr-req">*</span></label>
                      <input className="vr-input" id="first_name" type="text" value={form.first_name} onChange={set('first_name')} placeholder="John" autoComplete="given-name" disabled={isLoading} required />
                    </div>
                    <div className="vr-field">
                      <label className="vr-label" htmlFor="last_name">Last Name<span className="vr-req">*</span></label>
                      <input className="vr-input" id="last_name" type="text" value={form.last_name} onChange={set('last_name')} placeholder="Smith" autoComplete="family-name" disabled={isLoading} required />
                    </div>
                  </div>

                  {/* Job title */}
                  <div className="vr-field">
                    <label className="vr-label" htmlFor="job_title">Job Title<span className="vr-req">*</span></label>
                    <input className="vr-input" id="job_title" type="text" value={form.job_title} onChange={set('job_title')} placeholder="e.g. EHS Manager, Safety Director" disabled={isLoading} required />
                  </div>

                  {/* Username + Login Email */}
                  <div className="vr-frow">
                    <div className="vr-field">
                      <label className="vr-label" htmlFor="username">Username<span className="vr-req">*</span></label>
                      <input className="vr-input" id="username" type="text" value={form.username} onChange={set('username')} placeholder="gakinyi" autoComplete="username" disabled={isLoading} required />
                      <div className="vr-hint">Min. 3 characters. Used to sign in to Vigilo.</div>
                    </div>
                    <div className="vr-field">
                      <label className="vr-label" htmlFor="login_email">Login Email<span className="vr-req">*</span></label>
                      <input className="vr-input" id="login_email" type="email" value={form.login_email} onChange={set('login_email')} placeholder="grace@company.com" autoComplete="email" disabled={isLoading} required />
                      <div className="vr-hint">Your personal login — can differ from company email.</div>
                    </div>
                  </div>

                  {/* Password + Confirm */}
                  <div className="vr-frow">
                    <div className="vr-field">
                      <label className="vr-label" htmlFor="password">Password<span className="vr-req">*</span></label>
                      <div className="vr-fwrap">
                        <input
                          className="vr-input vr-input-pw"
                          id="password" type={showPw ? 'text' : 'password'}
                          value={form.password} onChange={set('password')}
                          placeholder="Min. 6 characters" autoComplete="new-password"
                          disabled={isLoading} required
                        />
                        <button type="button" className="vr-pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                          {showPw ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      <div className="vr-pw-bars">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className="vr-pw-bar" style={{ background: i < pwStr ? pwColor : '#e2ddd4' }} />
                        ))}
                      </div>
                      {form.password && <div className="vr-pw-lbl" style={{ color: pwColor }}>{pwLabel}</div>}
                    </div>
                    <div className="vr-field">
                      <label className="vr-label" htmlFor="confirm_pw">Confirm Password<span className="vr-req">*</span></label>
                      <div className="vr-fwrap">
                        <input
                          className={`vr-input vr-input-pw${pwsMatch ? ' vr-ok' : pwsMismatch ? ' vr-err' : ''}`}
                          id="confirm_pw" type={showCpw ? 'text' : 'password'}
                          value={form.confirmPassword} onChange={set('confirmPassword')}
                          placeholder="Re-enter password" autoComplete="new-password"
                          disabled={isLoading} required
                        />
                        <button type="button" className="vr-pw-toggle" onClick={() => setShowCpw(v => !v)} aria-label="Toggle confirm password">
                          {showCpw ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {form.confirmPassword && (
                        <div className="vr-match" style={{ color: pwsMatch ? '#16a34a' : '#dc2626' }}>
                          {pwsMatch ? '✓ Passwords match' : '✗ Does not match'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button className="vr-submit" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <><SpinIcon /> Setting up your workspace…</>
                  ) : (
                    <><BuildingIcon /> Create Company Workspace</>
                  )}
                </button>
              </form>
            )}

            {!success && (
              <p className="vr-link-row">
                Already have an account?{' '}
                <Link to="/login" className="vr-link">Sign in here</Link>
              </p>
            )}

            <p className="vr-footer">
              By creating an account you agree to our{' '}
              <a href="#tos">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.<br />
              Your company data is isolated and never shared with other Vigilo tenants.
            </p>
          </div>
        </main>

      </div>
    </div>
  );
};

export default RegisterPage;
