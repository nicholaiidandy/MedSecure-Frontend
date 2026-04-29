import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, Database, Clock, HardDrive, Network } from 'lucide-react';

export function MonitoringPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only admin can access
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'admin') {
    return null;
  }

  // Use relative URL to avoid X-Frame-Options issues with localhost
  // Grafana is accessible at /grafana through nginx proxy
  const grafanaUrl = window.location.origin.replace('medsecure.com', 'monitoring.medsecure.com');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">System Monitoring</h1>
            <p className="text-slate-600">Real-time metrics from Grafana (Prometheus + cAdvisor)</p>
          </div>
        </div>
      </div>

      {/* Grafana Container Metrics Dashboard Embed */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-600" />
          Container Metrics (CPU, Memory, Network)
        </h2>
        <iframe
          src={`${grafanaUrl}/d/container-metrics?orgId=1&refresh=10s&from=now-1h&to=now&kiosk`}
          width="100%"
          height="600"
          frameBorder="0"
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafana MongoDB Metrics Embed */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-green-600" />
            MongoDB Metrics (Query Duration, Rate, P95)
          </h2>
          <iframe
            src={`${grafanaUrl}/d/mongodb-metrics?orgId=1&refresh=10s&from=now-1h&to=now&kiosk`}
            width="100%"
            height="600"
            frameBorder="0"
            className="rounded-lg"
          />
        </div>

        {/* Backend API Metrics (if available) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Network className="w-6 h-6 text-purple-600" />
            Backend API Performance
          </h2>
          <iframe
            src={`${grafanaUrl}/d/container-metrics?orgId=1&refresh=10s&from=now-1h&to=now&var-job=medsecure-backend&kiosk&panelId=14`}
            width="100%"
            height="600"
            frameBorder="0"
            className="rounded-lg"
          />
          <p className="text-sm text-slate-500 mt-2">API Response Time P95 (prometheus job: medsecure-backend)</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Grafana Dashboards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`${grafanaUrl}/d/container-metrics?orgId=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <Cpu className="w-5 h-5 text-blue-600 mb-2" />
            <div>Container Metrics</div>
          </a>
          <a
            href={`${grafanaUrl}/d/mongodb-metrics?orgId=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <Database className="w-5 h-5 text-green-600 mb-2" />
            <div>MongoDB Metrics</div>
          </a>
          <a
            href={`${grafanaUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <Activity className="w-5 h-5 text-indigo-600 mb-2" />
            <div>Full Grafana</div>
            <div className="text-xs text-slate-500">(admin/admin)</div>
          </a>
        </div>
      </div>
    </div>
  );
}
