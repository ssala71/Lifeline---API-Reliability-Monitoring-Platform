import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ServiceMetrics from './ServiceMetrics';

describe('ServiceMetrics', () => {
  it('renders live response and incident data instead of fixed mock entries', () => {
    render(
      <ServiceMetrics
        services={[{
          id: 1,
          name: 'Payments API',
          url: 'https://payments.example.com',
          check_interval: 60,
          timeout: 10,
          slow_threshold: 1000,
          failure_threshold: 3,
          enabled: true,
          current_status: 'DEGRADED',
          created_at: '2026-09-22T00:00:00Z',
          updated_at: '2026-09-22T00:00:00Z',
        }]}
        latestChecks={{
          1: {
            id: 1,
            service_id: 1,
            status: 'DEGRADED',
            status_code: 200,
            response_time_ms: 1200,
            checked_at: '2026-09-22T00:01:00Z',
            error_message: null,
          },
        }}
        incidents={[{
          id: 1,
          service_id: 1,
          started_at: '2026-09-22T00:00:00Z',
          resolved_at: null,
          downtime_seconds: null,
          failure_count: 3,
          reason: 'High latency',
          alert_sent: true,
          recovery_alert_sent: false,
        }]}
      />,
    );

    expect(screen.getAllByText('Payments API')).toHaveLength(2);
    expect(screen.getByText('1200 ms')).toBeInTheDocument();
    expect(screen.getByText('High latency')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
