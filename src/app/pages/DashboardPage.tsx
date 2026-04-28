import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Activity, Shield, CheckCircle, AlertTriangle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { medicalRecordService, MedicalRecord } from '../services/medicalRecordService';
import { RecentActivitySection } from './RecentActivitySection';
import { patientService } from '../services/patientService';
import { userService } from '../services/userService';
import { auditLogService } from '../services/auditLogService';
import { vitalSignService, VitalSign } from '../services/vitalSignService';
import { toast } from 'sonner';

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  // Admin dashboard state
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [failedLogins, setFailedLogins] = useState<number | null>(null);
  const [adminStatsError, setAdminStatsError] = useState<string | null>(null);
  interface SecurityEvent {
    _id?: string;
    action: string;
    user?: { email: string };
  }
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityEventsLoading, setSecurityEventsLoading] = useState(false);
  const [securityEventsError, setSecurityEventsError] = useState<string | null>(null);
// Nurse dashboard state
  const [nurseLoading, setNurseLoading] = useState(false);
  const [nurseError, setNurseError] = useState<string | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<number>(0);
  const [vitalSignsToday, setVitalSignsToday] = useState<number>(0);

  // Fetch nurse dashboard stats
  useEffect(() => {
    if (user?.role === 'nurse') {
      setNurseLoading(true);
    setNurseError(null);
      
      // Fetch assigned patients (using getAll as proxy)
      patientService.getAll()
        .then((res: any) => {
          setAssignedPatients(Array.isArray(res.data) ? res.data.length : 0);
        })
        .catch(() => setNurseError('Failed to load patients'));

      // Fetch vital signs today for this nurse
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      vitalSignService.getAll()
        .then((res: any) => {
          const signs: VitalSign[] = Array.isArray(res.data) ? res.data : [];
          console.log('[DEBUG] user:', user);
          const nurseId = (user as any)._id?.toString() || (user as any).id?.toString();
          const todayStr = new Date().toISOString().slice(0, 10);
          const todaySigns = signs.filter(sign => {
            const recDate = (typeof sign.recordedAt === 'string' ? sign.recordedAt : new Date(sign.recordedAt).toISOString()).slice(0, 10);
            const signNurseId = (typeof sign.nurse === 'object' && sign.nurse !== null ? sign.nurse._id : sign.nurse)?.toString();
            return recDate === todayStr && signNurseId === nurseId;
          });
          console.log('[DEBUG] nurseId:', nurseId, 'todayStr:', todayStr);
          console.log('[DEBUG] Data vitalSigns:', signs);
          console.log('[DEBUG] Data todaySigns:', todaySigns);
          setVitalSignsToday(todaySigns.length);
        })
        .catch(() => setNurseError('Failed to load vital signs'));
      
      setNurseLoading(false);
    }
  }, [user]);

  // Doctor dashboard state
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [patientCountError, setPatientCountError] = useState<string | null>(null);
  const [recordCountError, setRecordCountError] = useState<string | null>(null);

  // Fetch doctor dashboard stats
  useEffect(() => {
    if (user?.role === 'doctor') {
      setDoctorLoading(true);
      setDoctorError(null);
      setPatientCountError(null);
      setRecordCountError(null);

      Promise.allSettled([
        patientService.getAll(),
        medicalRecordService.getAll(),
      ])
        .then(([patientsResult, recordsResult]) => {
          if (patientsResult.status === 'fulfilled') {
            const patientsRes: any = patientsResult.value;
            setTotalPatients(Array.isArray(patientsRes.data) ? patientsRes.data.length : 0);
          } else {
            setTotalPatients(0);
            setPatientCountError('Failed to load patients');
          }

          if (recordsResult.status === 'fulfilled') {
            const recordsRes: any = recordsResult.value;
            setTotalRecords(Array.isArray(recordsRes.data) ? recordsRes.data.length : 0);
            setRecentRecords(Array.isArray(recordsRes.data) ? recordsRes.data.slice(0, 5) : []);
          } else {
            setTotalRecords(0);
            setRecentRecords([]);
            setRecordCountError('Failed to load medical records');
          }

          if (patientsResult.status === 'rejected' && recordsResult.status === 'rejected') {
            setDoctorError('Failed to load dashboard data');
          }
        })
        .finally(() => setDoctorLoading(false));
    }
  }, [user]);
  useEffect(() => {
    if (user?.role === 'admin') {
      setAdminStatsError(null);
      (async () => {
        try {
          const usersRes: any = await userService.getAll();
          setTotalUsers(Array.isArray(usersRes.data) ? usersRes.data.length : 0);
        } catch {
          setAdminStatsError('Failed to load total users');
        }

        try {
          const statsRes: any = await auditLogService.getStats();
          if (statsRes.data?.byAction) {
            const failedLogin = statsRes.data.byAction.find((a: any) => a._id === 'Failed Login Attempt');
            setFailedLogins(failedLogin ? (failedLogin as any).count : 0);
          } else if (typeof statsRes.data?.failed === 'number') {
            setFailedLogins(statsRes.data.failed);
          } else {
            setFailedLogins(0);
          }
        } catch {
          setAdminStatsError('Failed to load failed logins');
        }
      })();
      // Fetch security events
      setSecurityEventsLoading(true);
      setSecurityEventsError(null);
      (async () => {
        try {
          const res: any = await auditLogService.getAll();
          const logs = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const events = logs.filter((log: any) =>
            [
              'Failed Login Attempt',
              'Account locked',
              'Password changed',
            ].includes(log.action)
          );
          setSecurityEvents(events);
        } catch {
          setSecurityEventsError('Failed to load security events');
        } finally {
          setSecurityEventsLoading(false);
        }
      })();
    }
  }, [user?.role]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  // Nurse Dashboard
  if (user.role === 'nurse') {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-slate-600 mt-1">Your assigned patients and recent activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mb-1">
              {nurseLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : assignedPatients}
            </p>
            <p className="text-sm text-slate-600">Assigned Patients</p>
            {nurseError && <p className="text-red-500 text-xs mt-1">{nurseError}</p>}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mb-1">
              {nurseLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : vitalSignsToday}
            </p>
            <p className="text-sm text-slate-600">Vital Signs Today</p>
            {nurseError && <p className="text-red-500 text-xs mt-1">{nurseError}</p>}
          </div>
        </div>

        <RecentActivitySection />
      </div>
    );
  }

  // Doctor Dashboard
  if (user.role === 'doctor') {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-slate-600 mt-1">Your patients and medical records overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mb-1">
              {doctorLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : totalPatients ?? 0}
            </p>
            <p className="text-sm text-slate-600">Total Patients</p>
            {patientCountError && <p className="text-red-500 text-xs mt-1">{patientCountError}</p>}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mb-1">
              {doctorLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : totalRecords ?? 0}
            </p>
            <p className="text-sm text-slate-600">Total Medical Records</p>
            {recordCountError && <p className="text-red-500 text-xs mt-1">{recordCountError}</p>}
          </div>
        </div>

        {recentRecords.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Recent Medical Records</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {recentRecords.map((record) => (
                <div key={record._id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{record.patient.name}</h3>
                      <p className="text-sm text-slate-600">{record.diagnosis}</p>
                    </div>
                    <span className="text-sm text-slate-500">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">System Overview</h1>
        <p className="text-slate-600 mt-1">Monitor and manage your medical system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900 mb-1">
            {adminStatsError ? <span className="text-red-500 text-sm">{adminStatsError}</span> : totalUsers ?? '–'}
          </p>
          <p className="text-sm text-slate-600">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900 mb-1">12</p>
          <p className="text-sm text-slate-600">Active Sessions</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900 mb-1">
            {adminStatsError ? <span className="text-red-500 text-sm">{adminStatsError}</span> : failedLogins ?? '–'}
          </p>
          <p className="text-sm text-slate-600">Failed Logins Today</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Healthy</span>
          </div>
          <p className="text-sm font-medium text-slate-900">System Health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Security Events</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {securityEventsLoading ? (
              <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-teal-600" /></div>
            ) : securityEventsError ? (
              <div className="p-6 text-center text-red-500">{securityEventsError}</div>
            ) : securityEvents.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No security events found.</div>
            ) : (
              securityEvents.slice(0, 5).map((event, index) => {
                const severity = event.action === 'Failed Login Attempt' ? 'warning' :
                  event.action === 'Account locked' ? 'critical' : 'info';
                return (
                  <div key={event._id || index} className="p-6 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{event.action}</h3>
                        <p className="text-sm text-slate-600">{event.user?.email || 'Unknown'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        severity === 'critical' ? 'bg-red-100 text-red-800' :
                        severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">System Status</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { service: 'API Server', uptime: '99.9%' },
              { service: 'Database', uptime: '100%' },
              { service: 'Blockchain', uptime: '99.8%' },
              { service: 'Auth Service', uptime: '100%' },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{service.service}</span>
                </div>
                <span className="text-sm text-slate-600">Uptime: {service.uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

