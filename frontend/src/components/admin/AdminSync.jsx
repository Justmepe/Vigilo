/**
 * AdminSync — SharePoint sync status panel
 */

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../../services/api/client';
import {
  Cloud, CloudOff, RefreshCw, CheckCircle, XCircle,
  Clock, AlertTriangle, RotateCcw,
} from 'lucide-react';

const ConfigGuide = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <CloudOff className="text-yellow-600 shrink-0" size={24} />
        <div>
          <h2 className="font-semibold text-yellow-800">SharePoint Not Configured</h2>
          <p className="text-sm text-yellow-700">Add your Azure credentials to the backend <code className="bg-yellow-100 px-1 rounded">.env</code> file to enable sync.</p>
        </div>
      </div>

      <div className="bg-white border border-yellow-100 rounded-lg p-4 text-sm space-y-3">
        <p className="font-semibold text-gray-700">Setup Steps:</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Go to <strong>Azure Portal → Azure Active Directory → App registrations</strong></li>
          <li>Register a new app (single tenant is fine)</li>
          <li>Under <strong>API Permissions</strong>, add <code className="bg-gray-100 px-1 rounded">Sites.ReadWrite.All</code> (Application type)</li>
          <li>Grant admin consent for the permission</li>
          <li>Under <strong>Certificates &amp; Secrets</strong>, create a client secret — copy the value immediately</li>
          <li>Copy your Tenant ID, Client ID, and Client Secret</li>
          <li>Add to <code className="bg-gray-100 px-1 rounded">backend/.env</code>:</li>
        </ol>
        <pre className="bg-gray-50 border rounded p-3 text-xs overflow-x-auto">{`SHAREPOINT_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SHAREPOINT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SHAREPOINT_CLIENT_SECRET=your-client-secret-value
SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com/sites/Safety
SHAREPOINT_LIBRARY=Safety Manager`}</pre>
        <p className="text-xs text-gray-400">
          The document library <strong>Safety Manager</strong> will be auto-created with <strong>Active/</strong> and <strong>Archived/</strong> folder structures when you first sync.
        </p>
      </div>
    </div>
  );
}

const AdminSync = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/sync/status');
      setStatus(res.data);
    } catch (err) {
      flash(err.message, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const retryFailed = async () => {
    setRetrying(true);
    try {
      const res = await apiClient.post('/admin/sync/retry-failed');
      flash(`${res.count} item(s) marked for retry. They will sync on next export.`);
      load();
    } catch (err) {
      flash(err.message, true);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-400">Loading sync status…</div>;

  if (!status?.configured) return <ConfigGuide />;

  const { forms, audits, failedItems } = status;
  const totalSynced  = forms.synced  + audits.synced;
  const totalPending = forms.pending + audits.pending;
  const totalFailed  = forms.failed  + audits.failed;
  const totalAll = totalSynced + totalPending + totalFailed;
  const pct = totalAll > 0 ? Math.round((totalSynced / totalAll) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SharePoint Sync</h1>
          <p className="text-sm text-gray-500">Microsoft Graph API document sync status</p>
        </div>
        <button onClick={load} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-2 rounded text-sm ${msg.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Overall health card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={totalFailed > 0 ? '#ef4444' : totalPending > 0 ? '#f59e0b' : '#22c55e'}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
            {pct}%
          </span>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <Cloud size={18} className="text-blue-500" />
            SharePoint Sync Health
          </p>
          <p className="text-sm text-gray-500">{totalSynced} of {totalAll} documents synced</p>
          {totalFailed > 0 && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <XCircle size={14} /> {totalFailed} failed — action required
            </p>
          )}
          {totalFailed === 0 && totalPending > 0 && (
            <p className="text-sm text-yellow-600 flex items-center gap-1">
              <Clock size={14} /> {totalPending} pending — will sync on next export
            </p>
          )}
          {totalFailed === 0 && totalPending === 0 && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle size={14} /> All documents synced
            </p>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Safety Forms', data: forms },
          { label: 'OSHA Audits', data: audits },
        ].map(({ label, data }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3">{label}</h3>
            <div className="space-y-2">
              {[
                { key: 'synced', label: 'Synced', icon: CheckCircle, color: 'text-green-600' },
                { key: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
                { key: 'failed', label: 'Failed', icon: XCircle, color: 'text-red-600' },
              ].map(({ key, label: lbl, icon: Icon, color }) => (
                <div key={key} className="flex justify-between items-center text-sm py-1">
                  <span className={`flex items-center gap-2 ${color}`}>
                    <Icon size={13} /> {lbl}
                  </span>
                  <span className="font-semibold text-gray-900">{data[key]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Failed items list */}
      {failedItems?.length > 0 && (
        <div className="bg-white border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} /> Failed Sync Items
            </h3>
            <button
              onClick={retryFailed}
              disabled={retrying}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
            >
              <RotateCcw size={13} /> {retrying ? 'Retrying…' : 'Retry All Failed'}
            </button>
          </div>
          <div className="space-y-2">
            {failedItems.map(item => (
              <div key={`${item.source}-${item.id}`}
                className="flex justify-between items-center text-sm bg-red-50 rounded px-3 py-2">
                <span className="text-gray-700">
                  {item.source === 'audit' ? 'OSHA Audit' : item.type} — ID {item.id}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Retry marks items as pending. They will re-sync when the document is next exported.
            To force immediate sync, go to the document in <strong>All Documents</strong> and click Sync.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 space-y-1">
        <p className="font-semibold">How sync works</p>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
          <li>Documents are automatically uploaded to SharePoint when exported (PDF/DOCX)</li>
          <li>Archived documents are automatically moved to the <strong>Archived/</strong> folder on SharePoint</li>
          <li>Deleted documents are removed from SharePoint</li>
          <li>Folder structure: <code className="bg-blue-100 px-1 rounded">Safety Manager / Active / [Type] /</code></li>
        </ul>
      </div>
    </div>
  );
}

export default AdminSync;
