import type { Request } from 'express';

export function normalizeParam(req: Request, key = 'id'): string | undefined {
  const raw = (req.params as Record<string, string | string[] | undefined>)[key];

  if (raw === undefined || raw === null) return undefined;
  if (Array.isArray(raw)) return raw[0];
  return String(raw);
}
