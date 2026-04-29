import { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { auditLogService, AuditLog } from '../services/auditLogService';


export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    setLoading(true);
    auditLogService.getAll()
      .then((res) => {
        // Support both {data: logs} and direct array
        setLogs(Array.isArray(res.data) ? res.data : res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load audit logs');
        setLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter(log => {
    const userName = typeof log.user === 'object' && log.user?.name ? log.user.name : String(log.user || 'Unknown');
    const matchesUser = !filterUser || userName.toLowerCase().includes(filterUser.toLowerCase());
    const dateStr = log.timestamp ? log.timestamp.slice(0, 10) : '';
    const matchesDate = !filterDate || dateStr === filterDate;
    const matchesAction = !filterAction || log.action.toLowerCase().includes(filterAction.toLowerCase());
    return matchesUser && matchesDate && matchesAction;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Audit Logs</h1>
            <p className="text-slate-600">System activity and security monitoring</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="font-medium text-slate-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User
            </label>
            <input
              type="text"
              placeholder="Filter by user..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Action Type
            </label>
            <input
              type="text"
              placeholder="Filter by action..."
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Blockchain Hash
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center text-red-500 py-8">{error}</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8">No audit logs found</td></tr>
              ) : filteredLogs.map((log) => {
                const userName = typeof log.user === 'object' && log.user?.name ? log.user.name : String(log.user || 'Unknown');
                // Compose details: resource/resourceId/metadata
                let details = '';
                if (log.resource && log.resourceId) {
                  details = `${log.resource}: ${log.metadata?.patientName || log.resourceId}`;
                } else if (log.resource) {
                  details = log.resource;
                } else if (log.metadata?.details) {
                  details = log.metadata.details;
                }
                // Status mapping
                const status = log.status === 'success' ? 'valid' : 'tampered';
                return (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{userName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{log.action}</p>
                        <p className="text-xs text-slate-600">{details}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs text-slate-600">{log.ipAddress}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {log.blockchainHash || '-'}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {status === 'valid' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Tampered
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500">No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
