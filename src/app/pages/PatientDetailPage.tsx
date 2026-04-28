import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Phone, Mail, Calendar, CheckCircle, Plus, Loader2, FileText } from 'lucide-react';
import { patientService, Patient } from '../services/patientService';
import { medicalRecordService, MedicalRecord, LabFile } from '../services/medicalRecordService';
import { toast } from 'sonner';

export function PatientDetailPage() {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [loading, setLoading] = useState(true);

  const canAddRecord = user?.role === 'doctor';
  const canUploadLab = user?.role === 'doctor';

  useEffect(() => {
    const loadDetails = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [patientResponse, recordResponse] = await Promise.all([
          patientService.getById(patientId),
          medicalRecordService.getByPatient(patientId),
        ]);

        setPatient(patientResponse.data ?? null);
        setRecords(recordResponse.data || []);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [patientId]);

  const safeNavigate = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.warn('Navigation failed:', error);
      window.location.href = path;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <button
          type="button"
          onClick={() => safeNavigate('/patients')}
          className="text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="inline w-5 h-5 mr-2" />
          Back to Patients
        </button>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Patient not found</h2>
          <p className="text-slate-600 mt-2">The selected patient could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => safeNavigate('/patients')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Patients
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{patient.name}</h1>
            <p className="text-slate-600 mt-1">Patient ID: {patient.patientId || patientId}</p>
          </div>
          {canAddRecord && (
            <button
              type="button"
              onClick={() => navigate('/add-record', { state: { patientId } })}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Record
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Patient Info</h2>
                <p className="text-sm text-slate-600">Personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Full Name</p>
                <p className="text-sm text-slate-900 mt-1">{patient.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Date of Birth</p>
                <p className="text-sm text-slate-900 mt-1">{patient.dateOfBirth?.slice(0, 10)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Gender</p>
                <p className="text-sm text-slate-900 mt-1">{patient.gender}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Blood Type</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                  {patient.bloodType}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-900 mb-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {patient.contactInfo?.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-900 mb-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {patient.contactInfo?.email || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Medical History</h2>
              <p className="text-sm text-slate-600 mt-1">Complete medical records</p>
            </div>

            {records.length === 0 ? (
              <div className="p-6 text-slate-600">No records found for this patient.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {records.map((record) => (
                  <div key={record._id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{record.diagnosis}</h3>
                          {record.isVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {record.date?.slice(0, 10)}
                          </span>
                          <span>Dr. {record.doctor.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Symptoms</p>
                        <p className="text-sm text-slate-900">{record.symptoms}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Prescription</p>
                        <p className="text-sm text-slate-900">{record.prescription}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Blockchain Hash</p>
                        <code className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">
                          {record.blockchainHash}
                        </code>
                      </div>

                      {/* Lab Files Section */}
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Lab Files (IPFS)</p>
                        {canUploadLab && (
                          <form
                            className="flex items-center gap-2 mb-2"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const input = fileInputs.current[record._id];
                              if (!input || !input.files || !input.files[0]) return;
                              setUploadingId(record._id);
                              try {
                                await medicalRecordService.uploadLabFile(record._id, input.files[0]);
                                toast.success('Lab file uploaded');
                                // Refresh records
                                const updated = await medicalRecordService.getByPatient(patientId!);
                                setRecords(updated.data || []);
                                input.value = '';
                              } catch (err: any) {
                                toast.error(err?.message || 'Upload failed');
                              } finally {
                                setUploadingId(null);
                              }
                            }}
                          >
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              className="block text-xs"
                              ref={(el) => {
                                fileInputs.current[record._id] = el;
                              }}
                              disabled={uploadingId === record._id}
                            />
                            <button
                              type="submit"
                              className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium"
                              disabled={uploadingId === record._id}
                            >
                              {uploadingId === record._id ? 'Uploading...' : 'Upload'}
                            </button>
                          </form>
                        )}
                        {record.labFiles && record.labFiles.length > 0 ? (
                          <ul className="space-y-1 mt-2">
                            {record.labFiles.map((file: LabFile, idx: number) => (
                              <li key={file.hash + idx} className="border rounded p-2 bg-slate-50">
                                <div className="flex items-center gap-2 text-xs">
                                  <a
                                    href={`https://ipfs.io/ipfs/${file.ipfsCid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-700 underline break-all"
                                  >
                                    {file.filename}
                                  </a>
                                  <span className="ml-auto text-slate-500">{new Date(file.uploadedAt).toLocaleString()}</span>
                                </div>
                                <div className="text-xs mt-1">
                                  <span className="font-mono text-slate-700">Hash:</span> <span className="break-all">{file.hash}</span>
                                </div>
                                <div className="text-xs">
                                  <span className="font-mono text-slate-700">Tx:</span> <span className="break-all">{file.txHash}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : record.labResults ? (
                          <div className="mt-2">
                            <a
                              href={record.labResults}
                              download="lab-result.pdf"
                              className="inline-flex items-center gap-2 text-xs font-medium text-teal-700 underline"
                            >
                              <FileText className="w-4 h-4" />
                              Download Lab Result PDF
                            </a>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">No lab files uploaded.</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
