import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, Database, Clock, HardDrive, Network } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts
const cpuData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 38 },
  { time: '08:00', value: 62 },
  { time: '12:00', value: 75 },
  { time: '16:00', value: 68 },
  { time: '20:00', value: 52 },
];

const memoryData = [
  { time: '00:00', value: 4.2 },
  { time: '04:00', value: 3.8 },
  { time: '08:00', value: 5.5 },
  { time: '12:00', value: 6.2 },
  { time: '16:00', value: 5.8 },
  { time: '20:00', value: 4.9 },
];

const apiResponseData = [
  { time: '00:00', value: 120 },
  { time: '04:00', value: 95 },
  { time: '08:00', value: 145 },
  { time: '12:00', value: 180 },
  { time: '16:00', value: 165 },
  { time: '20:00', value: 130 },
];

const failedLoginData = [
  { time: '00:00', value: 2 },
  { time: '04:00', value: 1 },
  { time: '08:00', value: 5 },
  { time: '12:00', value: 8 },
  { time: '16:00', value: 3 },
  { time: '20:00', value: 4 },
];

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">System Monitoring</h1>
            <p className="text-slate-600">Real-time system performance and health metrics</p>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-semibold text-slate-900">68%</span>
          </div>
          <p className="text-sm font-medium text-slate-900">CPU Usage</p>
          <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-semibold text-slate-900">5.8 GB</span>
          </div>
          <p className="text-sm font-medium text-slate-900">Memory Usage</p>
          <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-semibold text-slate-900">45ms</span>
          </div>
          <p className="text-sm font-medium text-slate-900">DB Query Time</p>
          <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">CPU Usage (%)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Memory Usage (GB)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#a855f7" fill="#d8b4fe" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* API Response Time Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-900">API Response Time (ms)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={apiResponseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Failed Login Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-slate-900">Failed Login Attempts</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={failedLoginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#fca5a5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Container Status */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Container Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Web Server', status: 'running', uptime: '99.9%' },
            { name: 'API Gateway', status: 'running', uptime: '99.8%' },
            { name: 'Database', status: 'running', uptime: '100%' },
            { name: 'Blockchain Node', status: 'running', uptime: '99.7%' },
          ].map((container, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{container.name}</p>
                  <p className="text-xs text-slate-600">Uptime: {container.uptime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}