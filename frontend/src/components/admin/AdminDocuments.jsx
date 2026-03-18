/**
 * AdminDocuments — full document table for admin
 * Props:
 *   showArchived: boolean — if true, shows archived documents
 */

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../../services/api/client';
import {
  Search, Archive, ArchiveRestore,
  Eye, Trash2, Cloud, ChevronLeft, ChevronRight,
  RefreshCw, CheckCircle, Clock, XCircle, Download,
} from 'lucide-react';

const FORM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'jsa', label: 'JSA' },
  { value: 'loto', label: 'LOTO' },
  { value: 'injury', label: 'Injury Report' },
  { value: 'accident', label: 'Accident Report' },
  { value: 'spillReport', label: 'Spill Report' },
  { value: 'monthlyInspection', label: 'Inspection' },
  { value: 'oshaAudit', label: 'OSHA Audit' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

const SyncBadge = ({ status }) => {
  if (status === 'synced') return (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <CheckCircle size={12} /> Synced
    </span>
  );
  if (status === 'failed') return (
    <span className="flex items-center gap-1 text-xs text-red-600">
      <XCircle size={12} /> Failed
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <Clock size={12} /> Pending
    </span>
  );
}

const StatusBadge = ({ status }) => {
  const map = {
    draft:     'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-700',
    reviewed:  'bg-green-100 text-green-700',
    closed:    'bg-purple-100 text-purple-700',
    archived:  'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

const DocumentDetailModal = ({ doc, onClose, onStatusChange, onArchive, onSync, onDownload, onRegenerateAI }) => {
  if (!doc) return null;
  const data = doc.form_data || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-bold text-gray-900">{doc.type_label}</h2>
            <p className="text-xs text-gray-500">ID: {doc.id} · {doc.source}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Submitted by', doc.user_name || doc.username],
              ['Facility', doc.facility || '—'],
              ['Department', doc.department || '—'],
              ['Date', new Date(doc.created_at).toLocaleString()],
              ['Status', <StatusBadge status={doc.status} />],
              ['AI Report', doc.has_ai_report ? '✓ Generated' : 'Not generated'],
              ['SharePoint', <SyncBadge status={doc.sharepoint_status} />],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium">{val}</p>
              </div>
            ))}
          </div>

          {/* Form data preview */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Form Data</p>
            <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto max-h-48">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

          {/* SharePoint link */}
          {doc.sharepoint_url && (
            <a
              href={doc.sharepoint_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Cloud size={14} /> View on SharePoint
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 p-5 border-t bg-gray-50">
          <button
            onClick={() => onDownload(doc)}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
          >
            <Download size={14} /> Download
          </button>
          {!doc.has_ai_report && (
            <button
              onClick={() => onRegenerateAI(doc)}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
            >
              ✦ Generate AI Report
            </button>
          )}
          {!doc.archived_at && doc.status !== 'reviewed' && (
            <button
              onClick={() => onStatusChange(doc, 'reviewed')}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Mark Reviewed
            </button>
          )}
          {!doc.archived_at && (
            <button
              onClick={() => onArchive(doc)}
              className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1"
            >
              <Archive size={14} /> Archive
            </button>
          )}
          {doc.archived_at && (
            <button
              onClick={() => onArchive(doc, true)}
              className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-1"
            >
              <ArchiveRestore size={14} /> Unarchive
            </button>
          )}
          {doc.sharepoint_status !== 'synced' && (
            <button
              onClick={() => onSync(doc)}
              className="px-3 py-1.5 text-sm bg-sky-600 text-white rounded hover:bg-sky-700 flex items-center gap-1"
            >
              <Cloud size={14} /> Sync to SharePoint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const AdminDocuments = ({ showArchived = false }) => {
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const limit = 25;

  const flash = (msg, isError = false) => {
    setActionMsg({ msg, isError });
    setTimeout(() => setActionMsg(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        archived: showArchived ? 'true' : 'false',
        page,
        limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });
      const res = await apiClient.get(`/admin/documents?${params}`);
      setDocs(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [showArchived, page, filters]);

  useEffect(() => { load(); }, [load]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [filters, showArchived]);

  const handleStatusChange = async (doc, newStatus) => {
    try {
      await apiClient.patch(`/admin/documents/${doc.id}/status`, { status: newStatus, source: doc.source });
      flash(`Status updated to ${newStatus}`);
      load();
      setSelectedDoc(null);
    } catch (err) {
      flash(err.message, true);
    }
  };

  const handleArchive = async (doc, unarchive = false) => {
    const confirmed = window.confirm(unarchive ? 'Unarchive this document?' : 'Archive this document? It will also be moved to the Archived folder on SharePoint.');
    if (!confirmed) return;
    try {
      const endpoint = unarchive ? 'unarchive' : 'archive';
      await apiClient.post(`/admin/documents/${doc.id}/${endpoint}`, { source: doc.source });
      flash(unarchive ? 'Document unarchived' : 'Document archived and synced to SharePoint');
      load();
      setSelectedDoc(null);
    } catch (err) {
      flash(err.message, true);
    }
  };

  const handleSync = async (doc) => {
    try {
      flash('Syncing…');
      await apiClient.post(`/admin/sync/${doc.id}`, { source: doc.source });
      flash('Synced to SharePoint');
      load();
      setSelectedDoc(null);
    } catch (err) {
      flash(err.message, true);
    }
  };

  const handleDelete = async (doc) => {
    const confirmed = window.confirm('Permanently delete this document? This cannot be undone.');
    if (!confirmed) return;
    try {
      await apiClient.delete(`/admin/documents/${doc.id}?source=${doc.source}`);
      flash('Document deleted');
      load();
    } catch (err) {
      flash(err.message, true);
    }
  };

  const handleRegenerateAI = async (doc) => {
    try {
      flash('Generating AI report…');
      await apiClient.post(`/admin/documents/${doc.id}/regenerate-ai`, { source: doc.source });
      flash('AI report generation started — refresh in a few seconds');
      setSelectedDoc(null);
    } catch (err) {
      flash('AI generation failed: ' + err.message, true);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const url = doc.source === 'audit'
        ? `/api/audit/${doc.id}/export-docx`
        : `/api/forms/${doc.id}/export-pdf`;
      const token = localStorage.getItem('authToken');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = doc.source === 'audit' ? `audit-${doc.id}.docx` : `${doc.form_type || 'form'}-${doc.id}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      flash('Download failed: ' + err.message, true);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showArchived ? 'Archived Documents' : 'All Documents'}
          </h1>
          <p className="text-sm text-gray-500">{total} document{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Flash message */}
      {actionMsg && (
        <div className={`px-4 py-2 rounded text-sm ${actionMsg.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {actionMsg.msg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents…"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>
        <select
          value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {FORM_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
          title="From date"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
          title="To date"
        />
        {(filters.search || filters.type || filters.status || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => setFilters({ search: '', type: '', status: '', dateFrom: '', dateTo: '' })}
            className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            <XCircle size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 text-sm">{error}</div>
        ) : docs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No documents found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Type', 'Submitted By', 'Facility', 'Date', 'Status', 'AI', 'SharePoint', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.map(doc => (
                  <tr key={`${doc.source}-${doc.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{doc.type_label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.user_name || doc.username || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{doc.facility || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {doc.has_ai_report ? (
                        <span className="text-green-500" title="AI report generated">✓</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SyncBadge status={doc.sharepoint_status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          title="View"
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          title="Download"
                          className="p-1 text-gray-400 hover:text-green-600"
                        >
                          <Download size={15} />
                        </button>
                        {!doc.archived_at ? (
                          <button
                            onClick={() => handleArchive(doc)}
                            title="Archive"
                            className="p-1 text-gray-400 hover:text-orange-500"
                          >
                            <Archive size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(doc, true)}
                            title="Unarchive"
                            className="p-1 text-gray-400 hover:text-green-600"
                          >
                            <ArchiveRestore size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc)}
                          title="Delete"
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedDoc && (
        <DocumentDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onStatusChange={handleStatusChange}
          onArchive={handleArchive}
          onSync={handleSync}
          onDownload={handleDownload}
          onRegenerateAI={handleRegenerateAI}
        />
      )}
    </div>
  );
}

export default AdminDocuments;
