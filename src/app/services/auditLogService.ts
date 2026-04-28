import { api } from './api';

export interface AuditLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  status: 'success' | 'failed';
  blockchainHash?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuditStats {
  total: number;
  success: number;
  failed: number;
  byAction: Array<{ _id: string; count: number }>;
}

export const auditLogService = {
  async getAll(filters?: {
    user?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.user) params.append('user', filters.user);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<AuditLog[]>(`/audit-logs${query}`);
  },

  async getStats() {
    return api.get<AuditStats>('/audit-logs/stats');
  },
};
