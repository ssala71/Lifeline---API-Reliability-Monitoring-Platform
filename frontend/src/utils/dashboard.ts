import type { Service, ServiceStatus } from '../types';

export function countStatuses(services: Pick<Service, 'current_status'>[]) {
  const counts: Record<ServiceStatus, number> = {
    UNKNOWN: 0,
    HEALTHY: 0,
    DEGRADED: 0,
    DOWN: 0,
  };

  services.forEach(service => {
    counts[service.current_status] += 1;
  });

  return { total: services.length, ...counts };
}
