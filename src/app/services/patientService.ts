import { api } from './api';

export interface Patient {
  _id: string;
  patientId: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisteredPatient {
  _id: string;
  name: string;
  email: string;
}

export interface CreatePatientData {
  patientId: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

export const patientService = {
  async getAll() {
    return api.get<Patient[]>('/patients');
  },

  async search(query: string) {
    return api.get<RegisteredPatient[]>('/patients/search?q=' + encodeURIComponent(query));
  },

  async getById(id: string) {
    return api.get<Patient>('/patients/' + id);
  },

  async create(data: CreatePatientData) {
    try {
      return await api.post<Patient>('/patients', data);
    } catch (error: any) {
      // Re-throw with more context for frontend
      error.response = error.response || {};
      throw error;
    }
  },

  async update(id: string, data: Partial<CreatePatientData>) {
    return api.put<Patient>('/patients/' + id, data);
  },

  async delete(id: string) {
    return api.delete('/patients/' + id);
  },
};

