/**
 * Safety Dashboard Component
 */
import React, { useState } from 'react';
import { LogOut, FileText, Home, ClipboardList, Lock, AlertOctagon, Car, AlertTriangle, CheckSquare, Clock, AlertCircle, TrendingUp, Plus, Settings, FolderOpen } from 'lucide-react';
import JSAForm from './forms/JSAFormEnhanced';
import LOTOForm from './forms/LOTOFormEnhanced';
import InjuryReportForm from './forms/InjuryReportForm';
import AccidentReportForm from './forms/AccidentReportForm';
import SpillReleaseForm from './forms/SpillReleaseForm';
import InspectionForm from './forms/InspectionForm';
import MyForms from './MyForms';
import {
  SEAFOOD_SPECIES,
  WORK_AREAS,
  HAZARDS_BY_AREA,
  PPE_OPTIONS
} from '../data/seafoodOperationsData';

const FormDashboard = ({ user, onLogout }) => {
  // activeView controls main content area: 'dashboard' | 'myforms'
  const [activeView, setActiveView] = useState('dashboard');

  // selectedForm: null = no form open
  // { type: 'jsa', formId: null, initialData: null } = new form
  // { type: 'jsa', formId: 123, initialData: {...} } = resume draft
  // { type: 'jsa', formId: null, initialData: {...} } = revise (new record, pre-filled)
  const [selectedForm, setSelectedForm] = useState(null);

  const forms = [
    { id: 'jsa',        name: 'Job Safety Analysis',         description: 'Analyze hazards and controls for a job/task',            icon: ClipboardList, color: 'bg-blue-100 hover:bg-blue-200',   iconColor: 'text-blue-600'   },
    { id: 'loto',       name: 'Lockout/Tagout',               description: 'Control hazardous energy during maintenance',             icon: Lock,          color: 'bg-yellow-100 hover:bg-yellow-200', iconColor: 'text-yellow-600' },
    { id: 'injury',     name: 'Injury/Incident Report',       description: 'Report workplace injuries and incidents',                 icon: AlertOctagon,  color: 'bg-red-100 hover:bg-red-200',     iconColor: 'text-red-600'    },
    { id: 'accident',   name: 'Accident Report',              description: 'Document vehicle and equipment accidents',                icon: Car,           color: 'bg-blue-100 hover:bg-blue-200',   iconColor: 'text-blue-600'   },
    { id: 'spill',      name: 'Spill/Release Report',         description: 'Document chemical spills and environmental releases',     icon: AlertTriangle, color: 'bg-orange-100 hover:bg-orange-200', iconColor: 'text-orange-600' },
    { id: 'inspection', name: 'Monthly Inspection',           description: 'Routine facility and equipment safety inspection',        icon: CheckSquare,   color: 'bg-green-100 hover:bg-green-200', iconColor: 'text-green-600'  },
  ];

  const openNewForm = (type) => setSelectedForm({ type, formId: null, initialData: null });
  const closeForm   = () => setSelectedForm(null);

  const handleFormComplete = () => {
    setSelectedForm(null);
    setActiveView('myforms'); // after submit, go to My Forms to see the result
  };

  // Called from MyForms when user clicks "Continue" on a draft
  const handleResume = (formType, formId, initialData) => {
    setSelectedForm({ type: formType, formId, initialData });
    setActiveView('dashboard');
  };

  // Called from MyForms when user clicks "Revise" on a submitted form
  // Creates a new record (formId = null) with pre-filled data and bumped revision
  const handleRevise = (formType, initialData) => {
    setSelectedForm({ type: formType, formId: null, initialData });
    setActiveView('dashboard');
  };

  // ── Active form view ────────────────────────────────────────────────────────
  if (selectedForm) {
    const { type, formId, initialData } = selectedForm;
    const commonProps = {
      formId,
      initialData,
      onSuccess: handleFormComplete,
      onCancel: closeForm,
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="mb-4">
          <button
            onClick={closeForm}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded transition"
          >
            <Home size={18} />
            Back to Dashboard
          </button>
        </div>

        {type === 'jsa'        && <JSAForm            {...commonProps} />}
        {type === 'loto'       && <LOTOForm           {...commonProps} />}
        {type === 'injury'     && <InjuryReportForm   {...commonProps} />}
        {type === 'accident'   && <AccidentReportForm {...commonProps} />}
        {type === 'spill'      && <SpillReleaseForm   {...commonProps} />}
        {type === 'inspection' && <InspectionForm     {...commonProps} />}
      </div>
    );
  }

  // ── My Forms view ───────────────────────────────────────────────────────────
  if (activeView === 'myforms') {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar user={user} onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 overflow-auto">
          <MyForms onResume={handleResume} onRevise={handleRevise} />
        </div>
      </div>
    );
  }

  // ── Main Dashboard view ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar user={user} onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 overflow-auto">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Safety Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="p-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatBox icon={<AlertTriangle size={20} className="text-red-500" />}    label="Hazards Identified" value={Object.values(HAZARDS_BY_AREA).flat().length} />
            <StatBox icon={<CheckSquare  size={20} className="text-green-500" />}   label="Species Tracked"    value={SEAFOOD_SPECIES.length} />
            <StatBox icon={<Lock        size={20} className="text-blue-500" />}    label="Work Areas"         value={WORK_AREAS.length} />
            <StatBox icon={<TrendingUp  size={20} className="text-purple-500" />}  label="PPE Items"          value={PPE_OPTIONS.length} />
          </div>

          {/* Create New Report */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((form) => {
                const IconComponent = form.icon;
                return (
                  <button
                    key={form.id}
                    onClick={() => openNewForm(form.id)}
                    className={`${form.color} rounded-lg shadow hover:shadow-lg transition p-4 text-left border-l-4 border-transparent hover:border-gray-400`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{form.name}</h3>
                        <p className="text-xs text-gray-700 mt-1">{form.description}</p>
                      </div>
                      <IconComponent size={24} className={form.iconColor} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* My Forms shortcut */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">My Forms</h3>
              <p className="text-sm text-gray-500 mt-1">View drafts, continue incomplete forms, download or revise submitted reports.</p>
            </div>
            <button
              onClick={() => setActiveView('myforms')}
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FolderOpen size={18} />
              Open My Forms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ user, onLogout, activeView, setActiveView }) => (
  <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg flex-shrink-0">
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <CheckSquare size={32} className="text-blue-400" />
        <div>
          <h1 className="text-xl font-bold">Safety Manager</h1>
          <p className="text-xs text-slate-400">Enterprise Edition</p>
        </div>
      </div>

      <nav className="space-y-1">
        <NavItem icon={<Home size={20} />}        label="Dashboard"   active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <NavItem icon={<FolderOpen size={20} />}  label="My Forms"    active={activeView === 'myforms'}   onClick={() => setActiveView('myforms')} />
        <NavItem icon={<Plus size={20} />}         label="New Report"  onClick={() => setActiveView('dashboard')} />
        <NavItem icon={<AlertCircle size={20} />}  label="Action Items" />
        <NavItem icon={<FileText size={20} />}    label="SDS Library" />
        <NavItem icon={<Settings size={20} />}    label="Settings" />
      </nav>

      <div className="border-t border-slate-700 mt-8 pt-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400">Logged In</p>
          <p className="font-semibold">{user?.name || 'Safety Manager'}</p>
          <p className="text-xs text-slate-400 mt-1">{user?.role || 'Safety Manager'}</p>
        </div>
        <button
          onClick={onLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  </div>
);

// Helper Components
const NavItem = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition text-left ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const StatBox = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <p className="text-sm font-medium text-gray-700">{label}</p>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default FormDashboard;
