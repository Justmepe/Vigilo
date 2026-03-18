/**
 * Admin Overview — stats dashboard
 */

import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api/client';
import {
  FileText, Users, Cloud, AlertTriangle,
  TrendingUp, Archive, CheckCircle, XCircle,
} from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    green:  'bg-green-50 text-green-600 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    gray:   'bg-gray-50 text-gray-600 border-gray-100',
  };
  return (
    <div className={`rounded-xl border p-5 flex items-start gap-4 ${colors[color]}`}>
      <div className="p-2 rounded-lg bg-white/60">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading stats…</div>;
  if (error)   return <div className="text-red-500 py-8 text-center">{error}</div>;

  const { documents, users, sharepoint, findings } = stats;
  const syncHealth = sharepoint.configured
    ? sharepoint.failedSync > 0
      ? { label: `${sharepoint.failedSync} failed`, color: 'red' }
      : sharepoint.pendingSync > 0
        ? { label: `${sharepoint.pendingSync} pending`, color: 'yellow' }
        : { label: 'All synced', color: 'green' }
    : { label: 'Not configured', color: 'gray' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Safety Manager platform statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Documents"
          value={documents.total}
          sub={`${documents.thisMonth} this month`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Active Users"
          value={users.active}
          sub={`${users.total} total accounts`}
          icon={Users}
          color="green"
        />
        <StatCard
          label="Archived"
          value={documents.archived}
          sub="documents archived"
          icon={Archive}
          color="gray"
        />
        <StatCard
          label="Critical Findings"
          value={findings.criticalOpen}
          sub="open, not closed"
          icon={AlertTriangle}
          color={findings.criticalOpen > 0 ? 'red' : 'green'}
        />
      </div>

      {/* SharePoint + Forms breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Forms breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Documents by Type
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Safety Forms (JSA, LOTO, Injury, etc.)', count: documents.forms },
              { label: 'OSHA/NFPA Audits', count: documents.audits },
            ].map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SharePoint status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Cloud size={16} className="text-blue-500" />
            SharePoint Sync
          </h2>

          {!sharepoint.configured ? (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              SharePoint is not configured. Add your Azure credentials to <code className="bg-gray-100 px-1 rounded">.env</code> to enable sync.
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 text-sm font-medium
                ${syncHealth.color === 'green' ? 'text-green-600' :
                  syncHealth.color === 'red' ? 'text-red-600' : 'text-yellow-600'}`}>
                {syncHealth.color === 'green'
                  ? <CheckCircle size={16} />
                  : <XCircle size={16} />
                }
                {syncHealth.label}
              </div>
              {[
                { label: 'Pending sync', value: sharepoint.pendingSync },
                { label: 'Failed', value: sharepoint.failedSync },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
