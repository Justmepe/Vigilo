/**
 * EHS Command Center — Admin Portal
 * Full 13-tab layout with collapsible dark navy sidebar
 */

import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../components/admin/admin.css';

// Admin section tabs (real API)
import AdminDocuments from '../components/admin/AdminDocuments';
import AdminUsers    from '../components/admin/AdminUsers';
import AdminSync     from '../components/admin/AdminSync';
import FormsTab      from '../components/admin/FormsTab';
import SettingsTab   from '../components/admin/SettingsTab';

// EHS section tabs (sample data)
import DashboardTab   from '../components/admin/DashboardTab';
import IncidentsTab   from '../components/admin/IncidentsTab';
import RiskTab        from '../components/admin/RiskTab';
import ActionsTab     from '../components/admin/ActionsTab';
import InspectionsTab from '../components/admin/InspectionsTab';
import TrainingTab    from '../components/admin/TrainingTab';
import PermitsTab     from '../components/admin/PermitsTab';
import PPETab         from '../components/admin/PPETab';
import WorkersTab     from '../components/admin/WorkersTab';
import ToolboxTab     from '../components/admin/ToolboxTab';

import {
  LayoutDashboard, AlertTriangle, Target, CheckSquare, ClipboardList,
  GraduationCap, FileCheck, HardHat, Users, MessageSquare, FileText,
  UserCog, Cloud, LogOut, ShieldCheck, ChevronLeft, Bell,
  Settings, ChevronRight, PlusSquare,
} from 'lucide-react';

const SECTIONS = [
  {
    label: 'SITUATIONAL',
    items: [
      { id: 'dashboard',   label: 'Dashboard',       icon: LayoutDashboard, color: '#2563eb' },
      { id: 'incidents',   label: 'Incidents',       icon: AlertTriangle,   color: '#dc2626', badge: 3 },
      { id: 'risk',        label: 'Risk Register',   icon: Target,          color: '#7c3aed' },
    ],
  },
  {
    label: 'COMPLIANCE',
    items: [
      { id: 'actions',     label: 'Action Tracker',  icon: CheckSquare,     color: '#ea580c', badge: 7 },
      { id: 'inspections', label: 'Inspections',     icon: ClipboardList,   color: '#0d9488' },
      { id: 'training',    label: 'Training Matrix', icon: GraduationCap,   color: '#16a34a' },
      { id: 'permits',     label: 'Permits to Work', icon: FileCheck,       color: '#f59e0b' },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { id: 'ppe',         label: 'PPE Tracker',     icon: HardHat,         color: '#0891b2' },
      { id: 'workers',     label: 'Workers on Site', icon: Users,           color: '#16a34a' },
      { id: 'toolbox',     label: 'Toolbox Talks',   icon: MessageSquare,   color: '#7c3aed' },
    ],
  },
  {
    label: 'FORMS',
    items: [
      { id: 'forms',       label: 'Submit Form',     icon: PlusSquare,      color: '#16a34a' },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { id: 'documents',   label: 'All Documents',   icon: FileText,        color: '#1d4ed8' },
      { id: 'users',       label: 'Users',           icon: UserCog,         color: '#64748b' },
      { id: 'sync',        label: 'SharePoint Sync', icon: Cloud,           color: '#0d9488' },
      { id: 'settings',    label: 'Company Settings',icon: Settings,        color: '#7c3aed' },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);

const PAGE_META = {
  dashboard:   { title: 'EHS Dashboard',       sub: 'Live safety overview',             bg: '#dbeafe', color: '#1d4ed8' },
  incidents:   { title: 'Incident Log',         sub: 'Track and investigate incidents',  bg: '#fee2e2', color: '#dc2626' },
  risk:        { title: 'Risk Register',        sub: 'Hazard identification & scoring',  bg: '#ede9fe', color: '#7c3aed' },
  actions:     { title: 'Action Tracker',       sub: 'Corrective & preventive actions',  bg: '#ffedd5', color: '#ea580c' },
  inspections: { title: 'Inspections',          sub: 'Scheduled inspection programme',   bg: '#ccfbf1', color: '#0d9488' },
  training:    { title: 'Training Matrix',      sub: 'Competency & certification status',bg: '#dcfce7', color: '#16a34a' },
  permits:     { title: 'Permits to Work',      sub: 'PTW authorisation & tracking',     bg: '#fef3c7', color: '#f59e0b' },
  ppe:         { title: 'PPE Tracker',          sub: 'Inventory levels & compliance',    bg: '#cffafe', color: '#0891b2' },
  workers:     { title: 'Workers on Site',      sub: 'Shift roster & check-in log',      bg: '#dcfce7', color: '#16a34a' },
  toolbox:     { title: 'Toolbox Talks',        sub: 'Safety briefings & attendance',    bg: '#ede9fe', color: '#7c3aed' },
  forms:       { title: 'Submit a Form',        sub: 'Fill & submit safety forms',        bg: '#dcfce7', color: '#16a34a' },
  documents:   { title: 'All Documents',        sub: 'Forms, reports & audits',          bg: '#dbeafe', color: '#1d4ed8' },
  users:       { title: 'User Management',      sub: 'Accounts, roles & access',         bg: '#f1f5f9', color: '#475569' },
  sync:        { title: 'SharePoint Sync',      sub: 'Cloud document integration',       bg: '#ccfbf1', color: '#0d9488' },
  settings:    { title: 'Company Settings',     sub: 'Branding, contact & report config', bg: '#ede9fe', color: '#7c3aed' },
};

const AdminPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [collapsed, setCollapsed]   = useState(false);

  if (!user)              return <Navigate to="/login"     replace />;
  if (!['Admin', 'SuperAdmin'].includes(user.role)) return <Navigate to="/dashboard" replace />;

  const meta = PAGE_META[activeTab] || PAGE_META.dashboard;
  const Icon = ALL_ITEMS.find(i => i.id === activeTab)?.icon || LayoutDashboard;

  return (
    <div className="admin-shell">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`admin-sb${collapsed ? ' collapsed' : ''}`}>
        {/* Brand */}
        <div className="sb-top">
          <div className="logo-box">
            <ShieldCheck size={16} color="#fff" />
          </div>
          {!collapsed && <span className="sb-brand">EHS Command</span>}
          <button className="col-btn" onClick={() => setCollapsed(v => !v)}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {SECTIONS.map(section => (
            <React.Fragment key={section.label}>
              {!collapsed && <div className="sb-section">{section.label}</div>}
              {section.items.map(({ id, label, icon: NavIcon, badge }) => (
                <button
                  key={id}
                  className={`ni${activeTab === id ? ' act' : ''}`}
                  onClick={() => setActiveTab(id)}
                  title={collapsed ? label : undefined}
                >
                  <NavIcon size={15} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
                  {!collapsed && badge ? <span className="nb">{badge}</span> : null}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-foot">
          {!collapsed && (
            <div className="user-card">
              <div className="u-name">{user.full_name || user.username}</div>
              <div className="u-role">System Administrator</div>
            </div>
          )}
          <button className="foot-ni" onClick={() => { logout(); window.location.href = '/login'; }} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={14} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="admin-wrap">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pg-icon-wrap" style={{ background: meta.bg }}>
              <Icon size={18} color={meta.color} />
            </div>
            <div>
              <div className="pg-title">{meta.title}</div>
              <div className="pg-sub">{meta.sub}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="icon-btn" title="Notifications">
              <Bell size={16} color="#475569" />
            </button>
            <button className="icon-btn" title="Settings">
              <Settings size={16} color="#475569" />
            </button>
            <div className="avatar" style={{ background: '#dbeafe', color: '#1e40af' }}>
              {(user.full_name || user.username || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="admin-main">
          <div className="acontent">
            {activeTab === 'dashboard'   && <DashboardTab />}
            {activeTab === 'incidents'   && <IncidentsTab />}
            {activeTab === 'risk'        && <RiskTab />}
            {activeTab === 'actions'     && <ActionsTab />}
            {activeTab === 'inspections' && <InspectionsTab />}
            {activeTab === 'training'    && <TrainingTab />}
            {activeTab === 'permits'     && <PermitsTab />}
            {activeTab === 'ppe'         && <PPETab />}
            {activeTab === 'workers'     && <WorkersTab />}
            {activeTab === 'toolbox'     && <ToolboxTab />}
            {activeTab === 'forms'       && <FormsTab />}
            {activeTab === 'documents'   && <AdminDocuments showArchived={false} />}
            {activeTab === 'users'       && <AdminUsers />}
            {activeTab === 'sync'        && <AdminSync />}
            {activeTab === 'settings'    && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
