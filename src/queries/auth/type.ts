import z from 'zod';

export const RoleSchema = z.enum(['admin', 'broker']);

export type Role = z.infer<typeof RoleSchema>;

// TODO: align with backend GET /me response.
export const MeSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: RoleSchema,
});

export type MeType = z.infer<typeof MeSchema>;
