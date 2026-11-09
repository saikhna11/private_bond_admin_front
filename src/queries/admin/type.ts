import z from 'zod';

export const AdminSchema = z.object({
  id: z.string(),
  email: z.string(),
  phone: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  /** The role the admin holds. */
  role: z.object({ id: z.string(), name: z.string() }).nullable(),
  /** The system role may call everything. */
  is_system_role: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export type AdminType = z.infer<typeof AdminSchema>;

export interface CreateAdminBody {
  email: string;
  phone: string;
  last_name: string;
  first_name: string;
  password: string;
  role_id: string;
}

export interface UpdateAdminBody {
  last_name?: string;
  first_name?: string;
}

/** The admin list's filters: the staff ones and a role. */
export interface AdminFilters {
  page?: number;
  q?: string;
  status?: 'active' | 'inactive';
  role_id?: string;
}
