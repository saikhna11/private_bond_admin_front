import z from 'zod';

/** One page of a list: page from 1, size up to 100. */
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    size: z.number(),
  });
}

export interface PageType<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/** Query string of a list request, without the empty values. */
export function listQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const PAGE_SIZE = 20;
