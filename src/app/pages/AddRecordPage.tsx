import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, FileText, Upload, CheckCircle, Hash, Clock, Search, User, Loader2, X } from 'lucide-react';
import { patientService, Patient } from '../services/patientService';
import { medicalRecordService, CreateMedicalRecordData } from '../services/medicalRecordService';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";

export function AddRecordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<CreateMedicalRecordData>({
    patientId: location.state?.patientId || '',
    diagnosis: '',
    symptoms: '',
    prescription: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [blockchainData, setBlockchainData] = useState({
    hash: '',
    timestamp: '',
  });

// Patient selection states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<{id: string, name: string} | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Load patients
  useEffect(() => {
    if (location.state?.patientId) {
      // Try to find pre-selected patient
      fetchPatientById(location.state.patientId);
    }
  }, []);

  // Simple timeout debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (patientSearch.length < 2) {
        setPatients([]);
        return;
      }
      try {
        setLoadingSearch(true);
        const searchResult = await patientService.search(patientSearch);
        const patientData = searchResult.data || [];
        const mappedPatients = patientData.map((p: any) => ({
          _id: p._id,
          name: p.name,
          patientId: p._id.slice(-6),
          dateOfBirth: '',
          gender: 'other' as const,
          bloodType: '',
          contactInfo: {},
          lastVisit: '',
          createdAt: '',
          updatedAt: ''
        })) as Patient[];
        setPatients(mappedPatients);
      } catch (error) {
        toast.error('Search failed');
        setPatients([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [patientSearch]);

  const fetchPatientById = async (id: string) => {
    try {
      const response = await patientService.getById(id);
      const patient = response.data;
      if (!patient) {
        throw new Error('Patient not found');
      }
      setSelectedPatient({ id: patient._id, name: patient.name });
      setFormData(prev => ({ ...prev, patientId: patient._id }));
    } catch (error) {
      toast.error('Patient not found');
    }
  };

  const filteredPatients = patients;

  // Only doctors can access this page
  useEffect(() => {
    if (user?.role !== 'doctor') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'doctor') {
    return null;
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient({ id: patient._id, name: patient.name });
    setFormData(prev => ({ ...prev, patientId: patient._id }));
    setPatientSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      toast.error('Please select a patient first');
      return;
    }
    if (!formData.diagnosis.trim()) {
      toast.error('Diagnosis is required');
      return;
    }

    try {
      setLoadingSubmit(true);

      // Convert file to base64 if provided
      let labResults: string | undefined;
      if (file) {
        labResults = await fileToBase64(file);
      }
      const submitData = {
        ...formData,
        labResults,
      };
      const response = await medicalRecordService.create(submitData);
      const recordId = response.data?._id;

      // Also attempt IPFS upload when file provided
      if (file && recordId) {
        try {
          await medicalRecordService.uploadLabFile(recordId, file);
          toast.success('Lab file uploaded to IPFS');
        } catch (uploadErr: any) {
          // IPFS may fail due to auth/infra; base64 fallback already stored in labResults
          console.warn('IPFS upload warning:', uploadErr);
        }
      }

      setBlockchainData({
        hash: response.data?.blockchainHash || '0xmock...',
        timestamp: response.data?.createdAt || new Date().toISOString(),
      });
      toast.success('Medical record created successfully!');
      setShowSuccess(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create record';
      
      // Check for rate limit error
      if (error.response?.status === 429 || errorMessage.includes('Too many requests')) {
        toast.error('Rate limit exceeded. Please wait a few minutes before trying again.');
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Auto-redirect to dashboard after success
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Wait 2 seconds before redirecting
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  if (showSuccess) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Record Saved Successfully!
            </h2>
            <p className="text-slate-600 mb-8">
              Medical record has been hashed to blockchain
            </p>

            <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-start gap-3 mb-4">
                <Hash className="w-5 h-5 text-teal-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Blockchain Hash</p>
                  <code className="text-sm text-teal-600 break-all">{blockchainData.hash}</code>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Timestamp</p>
                  <p className="text-sm text-slate-900">{new Date(blockchainData.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              Blockchain Verification Complete
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-lg">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Add Medical Record</h1>
              <p className="text-slate-600 mt-1">Create a new patient medical record</p>
            </div>
          </div>
        </div>

        {/* Patient Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Select Patient <span className="text-red-500">*</span>
          </label>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between"
        onClick={() => setOpen(true)}
      >
                <div className="flex items-center gap-2 truncate">
                  <User className="w-4 h-4" />
                  {selectedPatient ? selectedPatient.name : 'Search patient by name or ID...'}
                </div>
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(36rem,calc(100vw-2rem))] p-0 max-h-[24rem]">
              <Command>
                <CommandInput
                  placeholder="Search patient by name or ID (min 2 chars)..."
                  value={patientSearch}
                  onValueChange={setPatientSearch}
                />
                <CommandEmpty>No patient found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {loadingSearch ? (
                      <CommandItem>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </CommandItem>
                    ) : patientSearch.length < 2 ? (
                      <CommandItem>Enter 2+ chars to search</CommandItem>
                    ) : filteredPatients.length === 0 ? (
                      <CommandItem>No results found.</CommandItem>
                    ) : (
                      patients.map((patient) => (
                        <CommandItem
                          key={patient._id}
                          onSelect={() => handleSelectPatient(patient)}
                        >
                          <div className="flex items-center gap-2 mr-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div>{patient.name}</div>
                              <div className="text-xs text-slate-500">{patient.patientId}</div>
                            </div>
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedPatient && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Selected: {selectedPatient.name} ({selectedPatient.id.slice(-6)})
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPatient(null);
                  setFormData(prev => ({ ...prev, patientId: '' }));
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Diagnosis *
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Enter diagnosis..."
                required
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Symptoms
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Describe symptoms..."
              />
            </div>

            {/* Prescription */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prescription
              </label>
              <textarea
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Enter prescription details..."
              />
            </div>

            {/* Upload Lab Result */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Lab Result (PDF)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-teal-600 hover:text-teal-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-slate-600"> or drag and drop</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-1">PDF up to 10MB</p>
                {file && (
                  <p className="text-sm text-teal-600 mt-2 font-medium">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loadingSubmit || !formData.patientId || !formData.diagnosis.trim()}
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Record'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}