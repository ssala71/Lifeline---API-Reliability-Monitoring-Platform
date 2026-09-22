import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';

describe('frontend API client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('surfaces backend errors to the dashboard', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(api.getServices()).rejects.toThrow('Request failed (503)');
  });

  it('sends service deletion requests and accepts a 204 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.deleteService(7)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/services/7',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
