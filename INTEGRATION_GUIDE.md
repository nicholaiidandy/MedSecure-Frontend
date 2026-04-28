# Integration Guide - Frontend ke Backend API

Guide ini menjelaskan cara mengupdate pages frontend untuk menggunakan backend API.

## 📌 Prinsip Dasar

1. Import service yang sesuai dari `src/app/services/`
2. Gunakan `useState` untuk menyimpan data dan loading state
3. Gunakan `useEffect` untuk fetch data saat component mount
4. Handle loading, error, dan success states
5. Update UI berdasarkan data dari API

## 🔧 Pattern yang Digunakan

### 1. Fetch Data (GET)

```typescript
import { useState, useEffect } from 'react';
import { patientService, Patient } from '../services/patientService';

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await patientService.getAll();
      
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {patients.map(patient => (
        <div key={patient._id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

### 2. Create Data (POST)

```typescript
const [formData, setFormData] = useState({
  patientId: '',
  name: '',
  dateOfBirth: '',
  gender: 'male',
  bloodType: '',
});

const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setIsLoading(true);
    const response = await patientService.create(formData);
    
    if (response.success) {
      // Success - refresh list atau redirect
      fetchPatients();
      // Reset form
      setFormData({ /* initial values */ });
      // Show success message
      toast.success('Patient created successfully');
    }
  } catch (err: any) {
    setError(err.message || 'Failed to create patient');
    toast.error('Failed to create patient');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Update Data (PUT)

```typescript
const handleUpdate = async (id: string, data: any) => {
  try {
    setIsLoading(true);
    const response = await patientService.update(id, data);
    
    if (response.success) {
      // Update local state
      setPatients(prev => 
        prev.map(p => p._id === id ? response.data : p)
      );
      toast.success('Patient updated successfully');
    }
  } catch (err: any) {
    toast.error(err.message || 'Failed to update patient');
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Delete Data (DELETE)

```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this patient?')) {
    return;
  }
  
  try {
    setIsLoading(true);
    const response = await patientService.delete(id);
    
    if (response.success) {
      // Remove from local state
      setPatients(prev => prev.filter(p => p._id !== id));
      toast.success('Patient deleted successfully');
    }
  } catch (err: any) {
    toast.error(err.message || 'Failed to delete patient');
  } finally {
    setIsLoading(false);
  }
};
```

## 📋 Contoh Update untuk Pages

### PatientsPage.tsx

**SEBELUM (Mock Data):**
```typescript
const MOCK_PATIENTS = [
  { id: 'P001', name: 'John Anderson', ... },
  // ...
];

export function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPatients = MOCK_PATIENTS.filter(patient => {
    return patient.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div>
      {filteredPatients.map(patient => (
        <div key={patient.id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

**SESUDAH (API):**
```typescript
import { useState, useEffect } from 'react';
import { patientService, Patient } from '../services/patientService';
import { toast } from 'sonner';

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await patientService.getAll();
      
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch patients';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchPatients}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {filteredPatients.map(patient => (
        <div key={patient._id}>
          <span>{patient.patientId}</span>
          <span>{patient.name}</span>
          <span>{patient.bloodType}</span>
        </div>
      ))}
    </div>
  );
}
```

### PatientDetailPage.tsx

```typescript
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { patientService, Patient } from '../services/patientService';
import { medicalRecordService, MedicalRecord } from '../services/medicalRecordService';

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientData(patientId);
    }
  }, [patientId]);

  const fetchPatientData = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Fetch patient dan medical records secara parallel
      const [patientRes, recordsRes] = await Promise.all([
        patientService.getById(id),
        medicalRecordService.getByPatient(id),
      ]);

      if (patientRes.success && patientRes.data) {
        setPatient(patientRes.data);
      }

      if (recordsRes.success && recordsRes.data) {
        setMedicalRecords(recordsRes.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch patient data');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component
}
```

### AddRecordPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { medicalRecordService } from '../services/medicalRecordService';
import { toast } from 'sonner';

export function AddRecordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    prescription: '',
    labResults: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await medicalRecordService.create(formData);
      
      if (response.success && response.data) {
        toast.success(
          `Record created with blockchain hash: ${response.data.blockchainHash.substring(0, 10)}...`
        );
        navigate(`/patients/${formData.patientId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create medical record');
    } finally {
      setIsLoading(false);
    }
  };

  // ... form UI
}
```

### VitalSignsPage.tsx

```typescript
import { useState } from 'react';
import { vitalSignService } from '../services/vitalSignService';
import { patientService } from '../services/patientService';
import { toast } from 'sonner';

export function VitalSignsPage() {
  const [formData, setFormData] = useState({
    patientId: '',
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
    },
    heartRate: 75,
    temperature: 36.5,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    weight: 0,
    height: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await vitalSignService.create(formData);
      
      if (response.success) {
        toast.success('Vital signs recorded successfully');
        // Reset form atau redirect
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to record vital signs');
    }
  };

  // ... form UI
}
```

## 🔑 Key Points

1. **Gunakan `_id` bukan `id`** - MongoDB menggunakan `_id` sebagai identifier
2. **Handle loading states** - Show loading indicator saat fetching data
3. **Handle errors** - Tampilkan error messages yang user-friendly
4. **Use toast notifications** - Import dari 'sonner' untuk notifications
5. **Refresh data after mutations** - Re-fetch data setelah create/update/delete
6. **Type safety** - Gunakan TypeScript interfaces dari services

## 🎯 Migration Checklist

Untuk setiap page:

- [ ] Import service yang sesuai
- [ ] Remove mock data
- [ ] Add useState untuk data, loading, error
- [ ] Add useEffect untuk fetch data
- [ ] Update render logic untuk handle loading/error
- [ ] Update event handlers untuk call API
- [ ] Add success/error toast notifications
- [ ] Update data field names (id → _id, etc.)
- [ ] Test create, read, update, delete operations
- [ ] Handle edge cases (empty data, errors, etc.)

## 🚀 Testing

Untuk testing integration:

1. Start backend: `cd backend && pnpm dev`
2. Start frontend: `pnpm dev`
3. Login dengan demo credentials
4. Test CRUD operations di setiap page
5. Check browser console untuk errors
6. Check Network tab untuk API calls
7. Verify data di MongoDB

## 📝 Notes

- Token automatically included dalam semua API calls (via AuthHeader)
- 401 errors akan redirect ke login page
- 403 errors akan show "Access Denied" 
- Network errors akan show error toast
- Refresh page jika token expired
