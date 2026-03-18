import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './LoginPage.css';

/* Inline SVG helpers */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#0d1f35" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const SpinIcon = () => (
  <svg className="vl-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const FEATURES = [
  { title: 'Live EHS command dashboard',       desc: 'Incidents, alerts, and compliance scores at a glance every shift.' },
  { title: 'Risk register & action tracker',   desc: 'Likelihood × severity scoring with corrective action deadlines.' },
  { title: 'Training matrix & expiry alerts',  desc: 'Every certification tracked — never miss a renewal.' },
  { title: 'AI-generated safety reports',      desc: 'Automatic executive summaries after every form submission.' },
];

const LoginPage = () => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await login(username, password);
      if (result.success) {
        const role = result.user?.role;
        if (role === 'SuperAdmin' || role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Invalid username or password.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vigilo-login">
      <div className="vl-shell">

        {/* ── LEFT PANEL ── */}
        <div className="vl-left">
          <div className="vl-grid-bg" />
          <div className="vl-glow" />
          <div className="vl-ring" style={{ width: 500, height: 500, top: -150, right: -150 }} />
          <div className="vl-ring" style={{ width: 760, height: 760, top: -300, right: -300 }} />

          <div className="vl-content">
            {/* Logo */}
            <div className="vl-logo">
              <div className="vl-logo-box"><ShieldIcon /></div>
              <div>
                <div className="vl-logo-name">Vigilo</div>
                <div className="vl-logo-sub">I Watch Over</div>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="vl-tagline">
              Your safety operations,
              <em>always watched.</em>
            </h2>
            <p className="vl-desc">
              The EHS command platform built for processing industries — food, chemical, pharmaceutical, manufacturing and beyond.
            </p>

            {/* Features */}
            <div className="vl-features">
              {FEATURES.map((f) => (
                <div key={f.title} className="vl-feat">
                  <div className="vl-feat-dot"><CheckIcon /></div>
                  <div>
                    <div className="vl-feat-title">{f.title}</div>
                    <div className="vl-feat-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <hr className="vl-divider" />
            <div className="vl-stats">
              {[['6', 'Safety forms'], ['100%', 'Digital compliant'], ['24/7', 'Accessible']].map(([num, lbl]) => (
                <div key={lbl}>
                  <div className="vl-stat-num">{num}</div>
                  <div className="vl-stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="vl-right">
          <div className="vl-form-wrap">
            <div className="vl-live-row">
              <div className="vl-live-dot" />
              <span className="vl-live-text">Platform Live</span>
            </div>
            <h1 className="vl-heading">Welcome back</h1>
            <p className="vl-sub">Sign in to your Vigilo workspace to access your EHS command centre.</p>

            <div className="vl-card">
              {error && (
                <div className="vl-error">
                  <AlertIcon />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Username */}
                <div className="vl-field-group">
                  <label className="vl-label" htmlFor="username">Username</label>
                  <div className="vl-field-wrap">
                    <input
                      className="vl-input"
                      type="text"
                      id="username"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(''); }}
                      placeholder="Enter your username"
                      autoComplete="username"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="vl-field-group">
                  <label className="vl-label" htmlFor="password">Password</label>
                  <div className="vl-field-wrap">
                    <input
                      className="vl-input vl-input-pw"
                      type={showPw ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="vl-pw-toggle"
                      onClick={() => setShowPw(v => !v)}
                      aria-label="Toggle password visibility"
                    >
                      {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                <div className="vl-forgot-row">
                  <a href="#forgot" className="vl-forgot">Forgot password?</a>
                </div>

                <button className="vl-submit" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <><SpinIcon /> Signing in…</>
                  ) : (
                    'Sign In to Vigilo →'
                  )}
                </button>
              </form>
            </div>

            <p className="vl-link-row">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="vl-link">Create your workspace</Link>
            </p>
            <p className="vl-footer">© 2026 Vigilo EHS. All rights reserved.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
