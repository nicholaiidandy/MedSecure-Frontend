import { api } from './api';

export interface SecurityEvent {
  _id: string;
  eventType: 'failed_login' | 'account_locked' | 'suspicious_ip' | 'rate_limit' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  email?: string;
  ipAddress: string;
  description: string;
  actionTaken?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SecurityStats {
  total: number;
  today: number;
  critical: number;
  failedLogins: number;
  lockedAccounts: number;
  byType: Array<{ _id: string; count: number }>;
  bySeverity: Array<{ _id: string; count: number }>;
}

export const securityEventService = {
  async getAll(filters?: {
    eventType?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<SecurityEvent[]>(`/security-events${query}`);
  },

  async getStats() {
    return api.get<SecurityStats>('/security-events/stats');
  },
};
