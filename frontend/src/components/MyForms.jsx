/**
 * MyForms — lists all of the current user's forms (drafts + submitted).
 * Props:
 *   onResume(formType, formId, initialData)  — open a draft to continue
 *   onRevise(formType, formId, initialData)  — open a submitted form to revise (new revision)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getMyForms, exportFormPDF, deleteForm } from '../services/forms';
import { loadForm } from '../services/forms';

const FORM_LABELS = {
  jsa:               'Job Safety Analysis',
  loto:              'Lockout/Tagout',
  injury:            'Injury Report',
  accident:          'Accident Report',
  spill:             'Spill/Release Report',
  spillReport:       'Spill/Release Report',
  inspection:        'Safety Inspection',
  monthlyInspection: 'Monthly Inspection',
};

// Map backend form_type values to the frontend route key used by PDF export
const PDF_ROUTE_MAP = {
  jsa:        'jsa',
  loto:       'loto',
  injury:     'injury',
  accident:   'accident',
  spill:      'spill',
  inspection: 'inspection',
};

const STATUS_BADGE = {
  draft:     'bg-amber-100 text-amber-800 border border-amber-300',
  submitted: 'bg-green-100 text-green-800 border border-green-300',
};

export default function MyForms({ onResume, onRevise }) {
  const [activeTab, setActiveTab]   = useState('all');   // 'all' | 'draft' | 'submitted'
  const [forms, setForms]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // form object to confirm delete

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const statusFilter = activeTab === 'all' ? undefined : activeTab;
      const result = await getMyForms({ status: statusFilter, limit: 50 });
      setForms(result?.data?.forms || []);
    } catch (err) {
      setError('Failed to load forms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const handleDownload = async (form) => {
    setDownloadingId(form.id);
    try {
      const route = PDF_ROUTE_MAP[form.formType] || form.formType;
      await exportFormPDF(route, form.id);
    } catch {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResume = async (form) => {
    try {
      const result = await loadForm(form.id);
      const initialData = result?.data?.formData || {};
      onResume(form.formType, form.id, initialData);
    } catch {
      alert('Failed to load draft. Please try again.');
    }
  };

  const handleRevise = async (form) => {
    try {
      const result = await loadForm(form.id);
      const initialData = result?.data?.formData || {};
      // Bump revision number for the new revision
      const currentRev = parseInt(initialData.revisionNumber || '0', 10);
      const revisedData = { ...initialData, revisionNumber: String(currentRev + 1), _step: 1 };
      onRevise(form.formType, revisedData);
    } catch {
      alert('Failed to load form for revision. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteForm(confirmDelete.formType, confirmDelete.id);
      setForms(prev => prev.filter(f => f.id !== confirmDelete.id));
    } catch {
      alert('Failed to delete form. Please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const tabs = [
    { key: 'all',       label: 'All Forms' },
    { key: 'draft',     label: 'Drafts' },
    { key: 'submitted', label: 'Submitted' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
          <p className="text-sm text-gray-500 mt-1">View, continue, revise, or download your safety forms.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-700 border border-b-white border-gray-200 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={fetchForms}
            className="ml-auto px-3 py-1 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            title="Refresh"
          >
            ↺ Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-400">Loading forms…</div>
        )}

        {/* Empty */}
        {!loading && !error && forms.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">No forms found</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'draft' ? 'No drafts saved yet. Start a form and click "Save Draft".' : 'No forms submitted yet.'}
            </p>
          </div>
        )}

        {/* Forms list */}
        {!loading && forms.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Form Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Details</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forms.map(form => {
                  const label    = FORM_LABELS[form.formType] || form.formType;
                  const dateStr  = form.updatedAt || form.createdAt || '';
                  const displayDate = dateStr ? new Date(dateStr).toLocaleDateString() : '—';
                  const isDeleting  = deletingId === form.id;
                  const isDownloading = downloadingId === form.id;

                  return (
                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                      {/* Form type */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{label}</div>
                        {form.facility && (
                          <div className="text-xs text-gray-400">{form.facility}</div>
                        )}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {form.title || form.location || `Form #${form.id}`}
                        {form.revisionNumber && form.revisionNumber !== '0' && (
                          <span className="ml-1 text-xs text-gray-400">Rev {form.revisionNumber}</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{displayDate}</td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[form.status] || 'bg-gray-100 text-gray-600'}`}>
                          {form.status === 'draft' ? 'Draft' : 'Submitted'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {form.status === 'draft' && (
                            <button
                              onClick={() => handleResume(form)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                            >
                              Continue
                            </button>
                          )}

                          {form.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => handleDownload(form)}
                                disabled={isDownloading}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                              >
                                {isDownloading ? 'Downloading…' : '⬇ Download PDF'}
                              </button>
                              <button
                                onClick={() => handleRevise(form)}
                                className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600 transition-colors"
                              >
                                ✏ Revise
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setConfirmDelete(form)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
                          >
                            {isDeleting ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Form?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the{' '}
              <strong>{FORM_LABELS[confirmDelete.formType] || confirmDelete.formType}</strong> form
              {confirmDelete.status === 'draft' ? ' draft' : ''}.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
