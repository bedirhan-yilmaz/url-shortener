import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shortenUrl } from './shortener';

describe('shortenUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns ShortenResponse on success', async () => {
    const payload = { short_url: 'http://localhost/short/abc123', code: 'abc123' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
      }),
    );

    const result = await shortenUrl('https://example.com/long-path');

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shorten'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/long-path' }),
      }),
    );
  });

  it('throws with server detail message on 4xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ detail: 'Invalid URL' }),
      }),
    );

    await expect(shortenUrl('not-a-url')).rejects.toThrow('Invalid URL');
  });

  it('throws generic message when response body has no detail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      }),
    );

    await expect(shortenUrl('https://example.com')).rejects.toThrow('Request failed: 500');
  });

  it('throws generic message when json parse fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.reject(new Error('not json')),
      }),
    );

    await expect(shortenUrl('https://example.com')).rejects.toThrow('Request failed: 503');
  });
});
