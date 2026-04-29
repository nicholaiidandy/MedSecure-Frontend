// API Base URL — uses relative path when served through Nginx or Vite proxy,
// or full HTTPS URL in production / direct backend access
const isLocalDev = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

const isMedsecureHost = typeof window !== 'undefined' && (
  window.location.hostname === 'medsecure.com' ||
  window.location.hostname === 'www.medsecure.com' ||
  window.location.hostname === 'medsecure.local'
);

const API_URL = isLocalDev && window.location.port === '5173'
  ? '/api'   // Vite dev server proxy
  : (isMedsecureHost ? '/api' : ((import.meta as any).env.VITE_API_URL || '/api'));

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: any;
  count?: number;
}

class ApiService {
  private getAuthHeader(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : { message: 'Empty response' };
      }
    } catch (error: any) {
      console.error('Failed to parse response:', error);
      data = { message: 'Failed to parse server response' };
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeader(),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiService();

