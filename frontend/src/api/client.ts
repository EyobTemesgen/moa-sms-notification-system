const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('moa_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('moa_token');
    localStorage.removeItem('moa_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    apiRequest<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => apiRequest<any>('/auth/me'),

  // Payments
  getPayments: () => apiRequest<any[]>('/payments'),
  getStats: () => apiRequest<any>('/payments/stats'),
  createPayment: (payment: any) =>
    apiRequest<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  // SMS
  getSmsLogs: () => apiRequest<any[]>('/sms/logs'),
  testSms: (payload: { phoneNumber: string; message?: string; gatewayUrl?: string; apiKey?: string }) =>
    apiRequest<any>('/sms/test', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  retrySms: (id: string) =>
    apiRequest<any>(`/sms/retry/${id}`, {
      method: 'POST',
    }),

  // Settings
  getSettings: () => apiRequest<any>('/settings'),
  updateSettings: (settings: any) =>
    apiRequest<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  getRecipients: () => apiRequest<any[]>('/settings/recipients'),
  createRecipient: (recipient: any) =>
    apiRequest<any>('/settings/recipients', {
      method: 'POST',
      body: JSON.stringify(recipient),
    }),
  updateRecipient: (id: string, recipient: any) =>
    apiRequest<any>(`/settings/recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipient),
    }),
  deleteRecipient: (id: string) =>
    apiRequest<any>(`/settings/recipients/${id}`, {
      method: 'DELETE',
    }),
};

