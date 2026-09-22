import { describe, expect, it } from 'vitest';

import { countStatuses } from './dashboard';

describe('dashboard status counts', () => {
  it('counts every service status for the dashboard cards', () => {
    const counts = countStatuses([
      { current_status: 'HEALTHY' },
      { current_status: 'DEGRADED' },
      { current_status: 'DOWN' },
      { current_status: 'UNKNOWN' },
      { current_status: 'HEALTHY' },
    ]);

    expect(counts).toEqual({
      total: 5,
      UNKNOWN: 1,
      HEALTHY: 2,
      DEGRADED: 1,
      DOWN: 1,
    });
  });
});
