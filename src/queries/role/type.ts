import z from 'zod';

/** One admin operation a role may be granted (GET /privileges). */
export const PrivilegeSchema = z.object({
  id: z.string(),
  /** "module:action|Тайлбар"; operations sharing a module:action are one switch. */
  name: z.string(),
  method: z.string(),
  route: z.string(),
});

export type PrivilegeType = z.infer<typeof PrivilegeSchema>;

/** What an admin holds: the system role may call everything. */
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_system: z.boolean(),
  is_active: z.boolean(),
  admin_count: z.number(),
  privilege_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RoleType = z.infer<typeof RoleSchema>;
