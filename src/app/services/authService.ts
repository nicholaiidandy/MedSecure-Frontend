import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'doctor' | 'nurse' | 'patient';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  failedAttempts?: number;
  isLocked?: boolean;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin?: string;
    twoFactorEnabled: boolean;
    failedAttempts: number;
    isLocked: boolean;
  };
}

export const authService = {
  async login(credentials: LoginCredentials) {
    return api.post<{ token?: string; user: User }>('/auth/login', credentials);
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async adminRegister(data: RegisterData) {
    return api.post<{ success: true; user: User; token: string }>('/auth/admin/register', data);
  },

  async registerPatient(data: { name: string; email: string; password: string }) {
    return api.post<{ success: true; user: User; token: string }>('/auth/register', data);
  },

  async getMe() {
    return api.get<{ success: true; user: User }>('/auth/me');
  },

  async getProfile() {
    const response = await api.get<ProfileResponse>('/profile');
    return response;
  },

  async toggle2FA(enabled: boolean) {
    return api.put('/profile/2fa', { enabled });
  },

  async updateProfilePassword(currentPassword: string, newPassword: string) {
    return api.put('/profile/password', { currentPassword, newPassword });
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    return api.put('/auth/password', { currentPassword, newPassword });
  },

  clearLocalAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
