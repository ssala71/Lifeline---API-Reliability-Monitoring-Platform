import type { HealthCheck, Incident, Service, ServiceInput } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getServices: () => request<Service[]>('/services'),

  addService: (service: ServiceInput) =>
    request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    }),

  toggleService: (id: number, enabled: boolean) =>
    request<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),

  deleteService: (id: number) =>
    request<void>(`/services/${id}`, { method: 'DELETE' }),

  runHealthCheck: (id: number) =>
    request<HealthCheck>(`/services/${id}/check`, { method: 'POST' }),

  getHistory: (id: number, limit = 20) =>
    request<HealthCheck[]>(`/services/${id}/history?limit=${limit}`),

  getIncidents: () => request<Incident[]>('/incidents'),
};
