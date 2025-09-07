import type { Context } from 'hono';

// Dummy auth: read X-User-Id as ASCII lowercase string
export function getUserId(c: Context): string | null {
  const raw = c.req.header('x-user-id')?.trim() ?? '';
  if (!raw) return null;
  if (!/^[a-z0-9-]{1,32}$/.test(raw)) return null;
  return raw;
}

