import z from 'zod';

/** GET /me on the admin API. */
export const MeSchema = z.object({
  id: z.string(),
  email: z.string(),
  phone: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  role: z.string().optional(),
  is_super: z.boolean(),
});

export type MeType = z.infer<typeof MeSchema>;

export function personName(p: { last_name?: string; first_name?: string }) {
  return [p.last_name, p.first_name].filter(Boolean).join(' ');
}

export function personInitials(p: { last_name?: string; first_name?: string }) {
  return (
    [p.first_name, p.last_name]
      .map((w) => w?.[0]?.toUpperCase())
      .filter(Boolean)
      .join('') || 'A'
  );
}
