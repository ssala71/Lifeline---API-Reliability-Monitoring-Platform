export type ServiceStatus = 'UNKNOWN' | 'HEALTHY' | 'DEGRADED' | 'DOWN';

export interface Service {
  id?: number;
  name: string;
  url: string;
  check_interval: number;
  timeout: number;
  slow_threshold: number;
  failure_threshold: number;
  enabled: boolean;
  status?: ServiceStatus;
}

export interface HealthCheck {
  service_id: number;
  status: ServiceStatus;
  status_code: number;
  response_time_ms: number;
  checked_at: string;
}