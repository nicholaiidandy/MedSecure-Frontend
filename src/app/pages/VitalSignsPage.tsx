import { useState, useEffect } from 'react';
import { patientService, Patient } from '../services/patientService';
import { vitalSignService } from '../services/vitalSignService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Activity, Heart, Thermometer, Wind, Droplets } from 'lucide-react';

export function VitalSignsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patientId: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    notes: '',
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
    // Load patients for dropdown
    useEffect(() => {
      setLoadingPatients(true);
      patientService.getAll()
        .then(res => setPatients(res.data || []))
        .catch(() => setPatients([]))
        .finally(() => setLoadingPatients(false));
    }, []);
  const [submitted, setSubmitted] = useState(false);

  // Only nurses can access
  useEffect(() => {
    if (user?.role !== 'nurse') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'nurse') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await vitalSignService.create({
        patientId: formData.patientId,
        bloodPressure: {
          systolic: Number(formData.bloodPressureSystolic),
          diastolic: Number(formData.bloodPressureDiastolic),
        },
        heartRate: Number(formData.heartRate),
        temperature: Number(formData.temperature),
        oxygenSaturation: Number(formData.oxygenSaturation),
        respiratoryRate: Number(formData.respiratoryRate),
        notes: formData.notes,
      });
      setFormData({
        patientId: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        notes: '',
      });
    } catch (err) {
      alert('Gagal input vital sign');
    }
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Activity className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Vital Signs Recorded!</h2>
            <p className="text-slate-600">Patient vital signs have been successfully saved to the system.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Input Vital Signs</h1>
              <p className="text-slate-600">Record patient vital sign measurements</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Patient *
              </label>
              <select
                value={formData.patientId}
                onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                disabled={loadingPatients}
              >
                <option value="" disabled>
                  {loadingPatients ? 'Loading patients...' : 'Select a patient'}
                </option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Pressure */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-600" />
                    Blood Pressure (mmHg) *
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                    className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Systolic (e.g., 120)"
                    required
                  />
                  <input
                    type="number"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                    className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Diastolic (e.g., 80)"
                    required
                  />
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    Heart Rate (bpm) *
                  </div>
                </label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 72"
                  required
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                    Temperature (°C) *
                  </div>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 36.5"
                  required
                />
              </div>

              {/* Respiratory Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-600" />
                    Respiratory Rate (breaths/min)
                  </div>
                </label>
                <input
                  type="number"
                  value={formData.respiratoryRate}
                  onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 16"
                />
              </div>

              {/* Oxygen Saturation */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-teal-600" />
                    Oxygen Saturation (%)
                  </div>
                </label>
                <input
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 98"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Any additional observations or notes..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Save Vital Signs
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}