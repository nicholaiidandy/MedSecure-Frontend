import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, XCircle, Lock, Activity } from 'lucide-react';
import { auditLogService, AuditLog } from '../services/auditLogService';


export function SecurityEventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    failedLogins: 0,
    lockedAccounts: 0,
    suspiciousIPs: 0,
    rateLimits: 0,
  });

  // Only admin can access
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoading(true);
      setError(null);
      auditLogService.getAll()
        .then(res => {
          const logs = Array.isArray(res.data) ? res.data : res.data?.data || [];
          // Filter for security events
          const filtered = logs.filter(log =>
            [
              'Failed Login Attempt',
              'Account locked',
              'Suspicious IP Detected',
              'Rate Limit Triggered',
              'Password changed',
            ].includes(log.action)
          );
          setEvents(filtered);

          // Calculate stats
          const now = new Date();
          const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          let failedLogins = 0;
          let lockedAccounts = 0;
          let suspiciousIPs = 0;
          let rateLimits = 0;
          filtered.forEach(log => {
            const ts = log.timestamp ? new Date(log.timestamp) : null;
            if (log.action === 'Failed Login Attempt' && ts && ts > last24h) failedLogins++;
            if (log.action === 'Account locked') lockedAccounts++;
            if (log.action === 'Suspicious IP Detected') suspiciousIPs++;
            if (log.action === 'Rate Limit Triggered' && ts && ts.toDateString() === now.toDateString()) rateLimits++;
          });
          setStats({ failedLogins, lockedAccounts, suspiciousIPs, rateLimits });
        })
        .catch(() => setError('Failed to load security events'))
        .finally(() => setLoading(false));
    }
  }, [user?.role]);

  if (user?.role !== 'admin') {
    return null;
  }

  const getSeverityColor = (action: string) => {
    switch (action) {
      case 'Account locked':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'Failed Login Attempt':
      case 'Suspicious IP Detected':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'Rate Limit Triggered':
      case 'Password changed':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-800';
    }
  };

  const getIcon = (action: string) => {
    switch (action) {
      case 'Failed Login Attempt':
        return <XCircle className="w-6 h-6" />;
      case 'Account locked':
        return <Lock className="w-6 h-6" />;
      case 'Suspicious IP Detected':
        return <AlertTriangle className="w-6 h-6" />;
      case 'Rate Limit Triggered':
        return <Activity className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Security Events</h1>
            <p className="text-slate-600">Monitor suspicious activities and security incidents</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Failed Logins</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-semibold text-slate-900">{stats.failedLogins}</p>
          <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Locked Accounts</span>
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-semibold text-slate-900">{stats.lockedAccounts}</p>
          <p className="text-xs text-slate-500 mt-1">Requiring admin action</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Suspicious IPs</span>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-semibold text-slate-900">{stats.suspiciousIPs}</p>
          <p className="text-xs text-slate-500 mt-1">Blocked automatically</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Rate Limits</span>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-semibold text-slate-900">{stats.rateLimits}</p>
          <p className="text-xs text-slate-500 mt-1">Triggered today</p>
        </div>
      </div>

      {/* Security Events Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12"><span className="text-slate-500">Loading...</span></div>
        ) : error ? (
          <div className="col-span-2 text-center text-red-500 py-12">{error}</div>
        ) : events.length === 0 ? (
          <div className="col-span-2 text-center text-slate-500 py-12">No security events found.</div>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className={`rounded-xl p-6 border-2 ${getSeverityColor(event.action)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    {getIcon(event.action)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{event.action}</h3>
                    <p className="text-sm opacity-80">{event.resource || ''}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase`}>
                  {getSeverityColor(event.action).split(' ')[0].replace('bg-', '')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-75">User:</span>
                  <span className="font-medium">{event.user?.email || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-75">IP Address:</span>
                  <code className="font-mono text-xs bg-black bg-opacity-10 px-2 py-1 rounded">
                    {event.ipAddress || '-'}
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-75">Timestamp:</span>
                  <span className="font-medium">{event.timestamp ? new Date(event.timestamp).toLocaleString() : '-'}</span>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t`}>
                <p className="text-sm font-medium">Action Taken:</p>
                <p className="text-sm opacity-80 mt-1">{event.metadata?.details || '-'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}