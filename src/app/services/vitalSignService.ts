import { api } from './api';

export interface VitalSign {
  _id: string;
  patient: {
    _id: string;
    name: string;
    patientId: string;
  };
  nurse: {
    _id: string;
    name: string;
    email: string;
  };
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  weight?: number;
  height?: number;
  notes?: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVitalSignData {
  patientId: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export const vitalSignService = {
  async getAll() {
    return api.get<VitalSign[]>('/vital-signs');
  },

  async getByPatient(patientId: string) {
    return api.get<VitalSign[]>(`/vital-signs/patient/${patientId}`);
  },

  async create(data: CreateVitalSignData) {
    return api.post<VitalSign>('/vital-signs', data);
  },
};
