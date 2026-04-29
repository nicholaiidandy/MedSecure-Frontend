import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService, Patient } from '../services/patientService';
import { Filter, UserPlus, Eye, Edit, Plus, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';

interface CreatePatientData {
  patientId?: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

export function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const safeNavigate = (path: string, options?: { replace?: boolean; state?: any }) => {
    navigate(path, options);
  };
  

  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  // Removed search registered patient states
  const [formData, setFormData] = useState<CreatePatientData>({
    patientId: '',
    name: '',
    dateOfBirth: '',
    gender: 'male',
    bloodType: '',
    contactInfo: { phone: '', email: '', address: '' },
  });
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user?.role === 'doctor' || user?.role === 'admin';

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAll();
      setPatients(response.data || []);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Auto-generate unique patientId if empty
    const submitData = {
      ...formData,
      patientId: `P${Date.now().toString().slice(-6)}`,
      contactInfo: {
        ...formData.contactInfo,
        email: '', // No email
      }
    };
    try {
      setSubmitting(true);
      await patientService.create(submitData);
      toast.success('Patient profile created successfully!');
      setShowAddModal(false);
      loadPatients();
      resetForm();
    } catch (error: any) {
      const errorMsg = error.message || (error.response?.data?.message || 'Failed to create patient profile');
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      name: '',
      dateOfBirth: '',
      gender: 'male',
      bloodType: '',
      contactInfo: { phone: '', email: '', address: '' },
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || (patient.lastVisit ? patient.lastVisit.slice(0,10) >= filterDate : false);
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Patient Records</h1>
          <p className="text-slate-600 mt-1">Manage and view patient information</p>
        </div>
        {canEdit && (
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600">
                <UserPlus className="w-5 h-5" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Create new patient profile directly
                </DialogDescription>
              </DialogHeader>
                <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Name *</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date" 
                      value={formData.dateOfBirth} 
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Blood Type</Label>
                    <Input 
                      value={formData.bloodType} 
                      onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                      placeholder="A+, O-, etc"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
    <Input 
      value={formData.contactInfo.phone || ''} 
      onChange={(e) => setFormData({
        ...formData, 
        contactInfo: {...formData.contactInfo, phone: e.target.value}
      })}
    />

                  <Label>Address</Label>
    <Input 
      value={formData.contactInfo.address || ''} 
      onChange={(e) => setFormData({
        ...formData, 
        contactInfo: {...formData.contactInfo, address: e.target.value}
      })}
    />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || !formData.name?.trim() || !formData.dateOfBirth || !formData.bloodType?.trim()}>
  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
  Create Profile
</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 min-w-0">
            <Label htmlFor="patientSearch" className="text-sm font-medium mb-2 block">Search Patients (Name/ID)</Label>
            <Input
              id="patientSearch"
              placeholder="Type to filter patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-x-2 flex flex-wrap gap-2">
            <div className="min-w-[160px]">
              <Label htmlFor="dateFilter" className="text-sm font-medium mb-2 block">Last Visit From</Label>
              <Input
                id="dateFilter"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterDate('');
              }}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
            <Button 
              type="button" 
              onClick={loadPatients}
              variant="outline"
              className="whitespace-nowrap"
            >
              Refresh
            </Button>
          </div>
        </div>
        {filteredPatients.length > 0 && patients.length > filteredPatients.length && (
          <p className="text-xs text-slate-500 mt-2">
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        )}
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">DOB</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{patient.patientId}</span>
                  </td>
                  <td className="px-6 py-4">{patient.name}</td>
                  <td className="px-6 py-4 text-slate-600">{typeof patient.dateOfBirth === 'string' ? patient.dateOfBirth.split('T')[0] : patient.dateOfBirth}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {patient.bloodType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{patient.lastVisit?.slice(0,10)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => safeNavigate(`/patients/${patient._id}`)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-teal-600 hover:bg-teal-50"
                            onClick={() => safeNavigate('/add-record', { state: { patientId: patient._id } })}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="sr-only">Add Record</span>
                          </Button>
                          <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => safeNavigate(`/patients/${patient._id}`)}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={async () => {
                              if (confirm(`Delete patient ${patient.patientId} (${patient.name})?`)) {
                                try {
                                  await patientService.delete(patient._id);
                                  toast.success('Patient record deleted');
                                  loadPatients();
                                } catch (error: any) {
                                  toast.error(error.message || 'Delete failed');
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && !loading && (
          <div className="p-12 text-center">
            <p className="text-slate-500">
              {searchTerm || filterDate 
                ? 'No patients match the current filters. Try adjusting search or date range.'
                : 'No patient profiles yet. Use "Add Patient" to create your first medical profile from registered patients.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

