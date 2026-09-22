export type ServiceStatus = 'UNKNOWN' | 'HEALTHY' | 'DEGRADED' | 'DOWN';

export interface ServiceInput {
  name: string;
  url: string;
  check_interval: number;
  timeout: number;
  slow_threshold: number;
  failure_threshold: number;
  enabled: boolean;
}

export interface Service extends ServiceInput {
  id: number;
  current_status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

export interface HealthCheck {
  id: number;
  service_id: number;
  status: ServiceStatus;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
  error_message: string | null;
}

export interface Incident {
  id: number;
  service_id: number;
  started_at: string;
  resolved_at: string | null;
  downtime_seconds: number | null;
  failure_count: number;
  reason: string | null;
  alert_sent: boolean;
  recovery_alert_sent: boolean;
}
