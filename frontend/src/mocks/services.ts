import type { Service } from '../types';

export const mockServices: Service[] = [
  {
    id: 1,
    name: "Main Website",
    url: "https://example.com",
    check_interval: 60,
    timeout: 10,
    slow_threshold: 500,
    failure_threshold: 3,
    enabled: true,
    current_status: 'HEALTHY',
    created_at: '',
    updated_at: ''
  },
  {
    id: 2,
    name: "Payment Gateway",
    url: "https://api.payments.com/health",
    check_interval: 30,
    timeout: 5,
    slow_threshold: 300,
    failure_threshold: 2,
    enabled: true,
    current_status: 'DEGRADED',
    created_at: '',
    updated_at: ''
  },
  {
    id: 3,
    name: "Legacy Database API",
    url: "http://internal-db:8080/ping",
    check_interval: 120,
    timeout: 15,
    slow_threshold: 1000,
    failure_threshold: 3,
    enabled: true,
    current_status: 'DOWN',
    created_at: '',
    updated_at: ''
  },
  {
    id: 4,
    name: "Staging Server",
    url: "https://staging.example.com",
    check_interval: 300,
    timeout: 10,
    slow_threshold: 800,
    failure_threshold: 1,
    enabled: false,
    current_status: 'UNKNOWN',
    created_at: '',
    updated_at: ''
  }
];
