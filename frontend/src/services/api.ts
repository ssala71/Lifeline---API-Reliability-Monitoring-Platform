import type { Service } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const api = {
  async getServices(): Promise<Service[]> {
    const res = await fetch(`${API_BASE_URL}/services`);
    if (!res.ok) throw new Error('Failed to fetch services from server');
    return res.json();
  },

  async addService(service: Omit<Service, 'id' | 'status'>): Promise<Service> {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to add service');
    return res.json();
  },

  async toggleService(id: number, enabled: boolean): Promise<Service> {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json();
  },

  async deleteService(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete service');
  }
};