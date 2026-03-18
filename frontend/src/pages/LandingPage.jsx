import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.vigilo-lp .reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToCta = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const SvgShield = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );

  const SvgCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  return (
    <div className="vigilo-lp">

      {/* ── NAV ── */}
      <nav>
        <a className="nav-logo" href="/">
          <div className="nav-logo-icon" style={{ color: '#0d1f35' }}><SvgShield /></div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="nav-brand">Vigilo</span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,.35)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Source Sans 3',sans-serif", marginTop: '2px' }}>I Watch Over</span>
          </div>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <button className="nav-cta" onClick={() => navigate('/login')}>Sign In →</button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-ring" />
        <div className="hero-bg-ring" />
        <div className="hero-bg-ring" />
        <div className="hero-grid-lines" />
        <div className="hero-corner-accent" />

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              <span>EHS Management Platform · For Processing Industries</span>
            </div>
            <h1 className="hero-title">
              <em>Vigilo</em>
              watches over your
              safety operations
            </h1>
            <div className="hero-title-line" />
            <p className="hero-desc">
              Streamline incident reporting, inspections, and compliance tracking for food, chemical, pharmaceutical, and manufacturing facilities — one intelligent platform for every processing industry.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/register')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0d1f35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Get Started with Vigilo
              </button>
              <button className="btn-secondary" onClick={scrollToCta}>Watch Demo</button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">6</div>
                <div className="hero-stat-lbl">Safety Forms</div>
              </div>
              <div>
                <div className="hero-stat-num">45+</div>
                <div className="hero-stat-lbl">Form Fields</div>
              </div>
              <div>
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-lbl">Digital</div>
              </div>
            </div>
          </div>

          {/* Mockup */}
          <div className="hero-mockup">
            <div className="hero-mockup-glow" />
            <div className="float-badge float-badge-1">
              <div className="fb-label">Days Without Incident</div>
              <div className="fb-value green">14 days ↑</div>
            </div>
            <div className="float-badge float-badge-2">
              <div className="fb-label">Compliance Score</div>
              <div className="fb-value gold">87%</div>
            </div>
            <div className="mockup-window">
              <div className="mockup-titlebar">
                <div className="traffic-dot red" />
                <div className="traffic-dot yellow" />
                <div className="traffic-dot green" />
                <div className="mockup-url">app.vigiloehs.com/forms/jsa/new</div>
              </div>
              <div className="mockup-body">
                <div className="mock-form-card">
                  <div className="mock-form-card-header">
                    <span className="mock-form-title">JSA — Job Safety Analysis</span>
                    <span className="mock-form-badge">Active</span>
                  </div>
                  <div className="mock-field">
                    <div className="mock-label">Job Task Description</div>
                    <div className="mock-value">Equipment maintenance — Processing Line 3</div>
                  </div>
                  <div className="mock-field">
                    <div className="mock-label">Hazard Identified</div>
                    <div className="mock-value">Rotating machinery, pinch points, entanglement</div>
                  </div>
                  <div className="mock-field">
                    <div className="mock-label">Control Measures</div>
                    <div className="mock-value">Full LOTO procedure required before work begins</div>
                  </div>
                  <div className="risk-row">
                    <div className="risk-pill risk-low">LOW · Before</div>
                    <div className="risk-pill risk-med">MED · Residual</div>
                    <div className="risk-pill risk-high">HIGH · Uncontrolled</div>
                  </div>
                </div>
                <div className="mockup-ai-bar">
                  <div className="ai-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--vl-gold2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4l3 3"/>
                    </svg>
                  </div>
                  <div className="ai-text">AI safety report will be auto-generated upon submission</div>
                  <div className="ai-status">Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div className="stats-band">
        <div className="stat-item"><div className="stat-num">6</div><div className="stat-label">Safety Form Types</div></div>
        <div className="stat-item"><div className="stat-num">100%</div><div className="stat-label">Digital Compliant</div></div>
        <div className="stat-item"><div className="stat-num">24/7</div><div className="stat-label">Accessible</div></div>
        <div className="stat-item"><div className="stat-num">2 min</div><div className="stat-label">Avg Form Completion</div></div>
      </div>

      {/* ── INDUSTRIES STRIP ── */}
      <div style={{ background: 'var(--vl-cream2)', padding: '28px 5%', borderBottom: '1px solid #ddd8cc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9a8f7e', textTransform: 'uppercase', letterSpacing: '1.8px', textAlign: 'center', marginBottom: '20px' }}>
            Trusted across processing industries
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { label: 'Food Processing' },
              { label: 'Seafood Processing' },
              { label: 'Chemical' },
              { label: 'Pharmaceutical' },
              { label: 'Manufacturing' },
              { label: 'Oil & Gas' },
            ].map(({ label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--vl-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--vl-text)', letterSpacing: '.3px' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ABOUT / INTRO ── */}
      <section className="intro" id="about">
        <div className="intro-text reveal">
          <p className="section-eyebrow">Why Vigilo</p>
          <h2 className="section-title">Built for the <em>realities</em> of the processing floor</h2>
          <p className="section-desc">
            Paper-based safety documentation causes delays, errors, and compliance gaps. Vigilo replaces clipboards with a purpose-built digital platform designed around how your facility actually operates — whatever you process.
          </p>
          <div className="intro-checklist">
            {[
              { strong: 'AI-powered reports', rest: ' generated automatically from every submitted form' },
              { strong: 'Real-time alerts', rest: ' for critical incidents, overdue inspections, and hazards' },
              { strong: 'SharePoint integration', rest: ' keeps all documents synced automatically' },
              { strong: 'Training matrix', rest: ' tracks every certification and flags expiry dates' },
            ].map(({ strong, rest }) => (
              <div className="intro-check" key={strong}>
                <div className="check-icon"><SvgCheck /></div>
                <div className="check-text"><strong>{strong}</strong>{rest}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="intro-visual reveal">
          <div className="intro-small-card isc-2">
            <div className="isc-label">Open Incidents</div>
            <div className="isc-val">3 active</div>
          </div>
          <div className="intro-main-card">
            <div className="imc-header">
              <div className="imc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--vl-gold2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div>
                <div className="imc-title">EHS Command Dashboard</div>
                <div className="imc-sub">Live · Morning Shift · Facility 01</div>
              </div>
            </div>
            <div className="imc-metrics">
              {[
                { val: '14', lbl: 'Days without incident' },
                { val: '87%', lbl: 'Compliance score' },
                { val: '47', lbl: 'Workers on site' },
                { val: '4/7', lbl: 'Inspections done' },
              ].map(({ val, lbl }) => (
                <div className="imc-metric" key={lbl}>
                  <div className="imc-metric-val">{val}</div>
                  <div className="imc-metric-lbl">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="intro-small-card isc-1">
            <div className="isc-label">Compliance Score</div>
            <div className="isc-val green">87% ↑</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section" id="features">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal">
            <p className="section-eyebrow">Platform Capabilities</p>
            <h2 className="section-title">Everything your <em>EHS team</em> needs</h2>
            <p className="section-desc">Comprehensive tools built for the daily realities of safety management — across any processing industry</p>
          </div>
          <div className="features-grid reveal">
            {[
              {
                n: '01', title: 'Digital Safety Forms',
                desc: 'JSA, LOTO, injury reports, accident reports, spill reports, and monthly inspections — all paperless with automatic PDF generation.',
                path: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>
              },
              {
                n: '02', title: 'Incident & Risk Management',
                desc: 'Log incidents, build your risk register with likelihood × severity scoring, and track corrective actions to completion.',
                path: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
              },
              {
                n: '03', title: 'Training Matrix',
                desc: 'Track certifications per worker, get automated expiry alerts, schedule renewals, and export compliance matrices for audits.',
                path: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>
              },
              {
                n: '04', title: 'Permits to Work',
                desc: 'Issue and approve hot work, confined space, electrical, LOTO, and working-at-height permits with digital sign-off workflows.',
                path: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
              },
              {
                n: '05', title: 'Real-Time Alerts',
                desc: 'Instant notifications for critical incidents, overdue actions, expiring permits, and non-compliance flagged automatically.',
                path: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>
              },
              {
                n: '06', title: 'SharePoint Sync',
                desc: 'Every submitted form and generated report automatically uploads to your SharePoint document library, organized by type and date.',
                path: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              },
            ].map(({ n, title, desc, path }) => (
              <div className="feat-card" key={n}>
                <span className="feat-num">{n}</span>
                <div className="feat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--vl-gold2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">{path}</svg>
                </div>
                <div className="feat-title">{title}</div>
                <div className="feat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="security" id="security">
        <div className="reveal">
          <p className="section-eyebrow">Built for Enterprise</p>
          <h2 className="section-title">Enterprise-grade <em>security</em></h2>
          <p className="section-desc">Your safety data is protected with current industry standards. Every access logged, every transmission encrypted.</p>
          <div className="security-checks">
            {[
              'End-to-end data encryption',
              'JWT authentication with role-based access',
              'Complete audit trails — every action logged',
              'OSHA documentation requirements met',
              'Multi-company isolation — data never crosses tenants',
            ].map((text) => (
              <div className="sec-check" key={text}>
                <div className="sec-check-dot"><SvgCheck /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="security-visual reveal">
          {[
            {
              title: 'Data Protection',
              desc: 'All data encrypted at rest and in transit. Zero plaintext storage of sensitive safety records.',
              path: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
            },
            {
              title: 'Compliance Ready',
              desc: 'Meets OSHA, ISO 45001, and industry-specific regulatory documentation standards out of the box.',
              path: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            },
            {
              title: 'Multi-Tenant Isolation',
              desc: 'Each company operates in a fully isolated workspace. Super Admins manage their own users and data.',
              path: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>
            },
          ].map(({ title, desc, path }) => (
            <div className="sec-item" key={title}>
              <div className="sec-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--vl-gold2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">{path}</svg>
              </div>
              <div>
                <div className="sec-title">{title}</div>
                <div className="sec-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUOTE ── */}
      <div className="quote-section reveal">
        <div className="quote-mark">"</div>
        <p className="quote-text">
          Safety documentation should take minutes, not hours — and it should never fall through the cracks because someone forgot to file a paper form.
        </p>
        <p className="quote-author">— <strong>EHS Manager</strong>, Processing Industry Customer</p>
      </div>

      {/* ── CTA ── */}
      <section className="cta-section" id="cta-section">
        <div className="cta-box reveal">
          <p className="cta-eyebrow">Get Started Today</p>
          <h2 className="cta-title">Ready to transform your <em>safety management?</em></h2>
          <p className="cta-desc">
            Set up your company workspace in minutes. Your team deserves tools that match the seriousness of the work.
          </p>
          <div className="cta-actions">
            <button className="btn-primary" style={{ fontSize: '16px', padding: '17px 36px' }} onClick={() => navigate('/register')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#0d1f35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Create Your Company Account
            </button>
            <button className="btn-secondary" style={{ fontSize: '16px', padding: '17px 36px' }} onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          <p className="cta-note">No credit card required &nbsp;·&nbsp; <a href="/login">Already have an account?</a></p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <div className="footer-brand-icon" style={{ color: '#0d1f35' }}><SvgShield /></div>
              Vigilo
            </div>
            <p className="footer-tagline">The EHS command platform for processing industries worldwide. Built for the floor, designed for compliance.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="/register">Get Started</a>
            <a href="/login">Sign In</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="/">Careers</a>
            <a href="/">Blog</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Use</a>
            <a href="/">Compliance</a>
            <a href="/">Cookie Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Vigilo EHS. All rights reserved.</span>
          <div className="footer-social">
            <a href="/">Twitter</a>
            <a href="/">LinkedIn</a>
            <a href="/">Email</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
