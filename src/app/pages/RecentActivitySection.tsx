import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { vitalSignService, VitalSign } from '../services/vitalSignService';

interface ActivityItem {
  patient: string;
  action: string;
  time: string;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function RecentActivitySection() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Nurses can't access medicalRecordService.getAll()
    if (user?.role === 'nurse') {
      vitalSignService.getAll()
        .then((vitalRes) => {
          const vitalSigns: VitalSign[] = vitalRes.data || [];
          console.log('[DEBUG] Data vitalSigns recent:', vitalSigns);
          console.log('[DEBUG] user:', user);
          const nurseId = (user as any)._id?.toString() || (user as any).id?.toString();
          const filtered = vitalSigns.filter(vs => {
            const vsNurseId = (typeof vs.nurse === 'object' && vs.nurse !== null ? vs.nurse._id : vs.nurse)?.toString();
            return vsNurseId === nurseId;
          });
          console.log('[DEBUG] nurseId:', nurseId);
          console.log('[DEBUG] Data vitalSigns recent:', vitalSigns);
          console.log('[DEBUG] Data filtered recent:', filtered);
          filtered.sort((a, b) => new Date(b.recordedAt || b.createdAt).getTime() - new Date(a.recordedAt || a.createdAt).getTime());
          const vitalActivities = filtered.slice(0, 10).map(vs => ({
            patient: vs.patient?.name || 'Unknown',
            action: 'Vital signs recorded',
            time: getRelativeTime(vs.recordedAt || vs.createdAt),
          }));
          setActivities(vitalActivities.slice(0, 5));
        })
        .catch(() => setError('Failed to load recent activity'))
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        vitalSignService.getAll(),
        medicalRecordService.getAll(),
      ])
        .then(([vitalRes, recordRes]) => {
          const vitalSigns: VitalSign[] = vitalRes.data || [];
          const records: MedicalRecord[] = recordRes.data || [];

          // Map vital signs to activity items
          const vitalActivities = vitalSigns.slice(0, 10).map(vs => ({
            patient: vs.patient?.name || 'Unknown',
            action: 'Vital signs recorded',
            time: getRelativeTime(vs.recordedAt || vs.createdAt),
          }));

          // Map medical records to activity items
          const recordActivities = records.slice(0, 10).map(rec => ({
            patient: rec.patient?.name || 'Unknown',
            action: rec.diagnosis ? 'Diagnosis: ' + rec.diagnosis : 'Medical record updated',
            time: getRelativeTime(rec.date || rec.createdAt),
          }));

          // Merge and sort by most recent
          const all = [...vitalActivities, ...recordActivities].sort((a, b) => {
            // Use the original date for sorting
            const aDate = new Date(a.time === 'just now' ? new Date() : a.time.includes('ago') ? new Date(Date.now() - parseInt(a.time) * 60000) : new Date());
            const bDate = new Date(b.time === 'just now' ? new Date() : b.time.includes('ago') ? new Date(Date.now() - parseInt(b.time) * 60000) : new Date());
            return bDate.getTime() - aDate.getTime();
          });

          setActivities(all.slice(0, 5));
        })
        .catch(() => setError('Failed to load recent activity'))
        .finally(() => setLoading(false));
    }
  }, [user?.role]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No recent activity found.</div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{activity.patient}</h3>
                  <p className="text-sm text-slate-600 mt-1">{activity.action}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}