import { api } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse';
  lastLogin?: string;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'doctor' | 'nurse';
  twoFactorEnabled?: boolean;
}

export const userService = {
  async getAll() {
    return api.get<User[]>('/users');
  },

  async getById(id: string) {
    return api.get<User>(`/users/${id}`);
  },

  async update(id: string, data: UpdateUserData) {
    return api.put<User>(`/users/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/users/${id}`);
  },

  async unlock(id: string) {
    return api.put<User>(`/users/${id}/unlock`, {});
  },
};
