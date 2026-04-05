import type { ShortenResponse } from '../types';

const BASE = (import.meta.env.VITE_API_BASE as string) ?? '';

export async function shortenUrl(url: string): Promise<ShortenResponse> {
  const res = await fetch(`${BASE}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<ShortenResponse>;
}
