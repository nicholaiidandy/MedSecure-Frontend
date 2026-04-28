import { api } from './api';

export interface LabFile {
  filename: string;
  ipfsCid: string;
  hash: string;
  txHash: string;
  uploadedAt: string;
}

export interface MedicalRecord {
  _id: string;
  patient: {
    _id: string;
    name: string;
    patientId: string;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  diagnosis: string;
  symptoms: string;
  prescription: string;
  labResults?: string;
  labFiles?: LabFile[];
  blockchainHash: string;
  blockchainTimestamp: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordData {
  patientId: string;
  diagnosis: string;
  symptoms: string;
  prescription: string;
  labResults?: string;
}

export interface VerificationResult {
  recordId: string;
  dbHash: string;
  blockchainHash: string;
  currentHash: string;
  isValid: boolean;
  timestamp: string;
  recordDetails: {
    patient: string;
    diagnosis: string;
    date: string;
    patientId?: string;
  };
}

export const medicalRecordService = {
  async getAll() {
    return api.get<MedicalRecord[]>('/medical-records');
  },

  async getByPatient(patientId: string) {
    return api.get<MedicalRecord[]>(`/medical-records/patient/${patientId}`);
  },

  async create(data: CreateMedicalRecordData) {
    return api.post<MedicalRecord>('/medical-records', data);
  },

  async verify(recordId: string) {
    return api.post<VerificationResult>('/medical-records/verify', { recordId });
  },

  async uploadLabFile(recordId: string, file: File) {
    const formData = new FormData();
    formData.append('labFile', file);
    const response = await fetch(
      `${(import.meta as any).env.VITE_API_URL || '/api'}/medical-records/${recordId}/lab-file`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },
};
