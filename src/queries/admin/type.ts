import z from 'zod';

export const AdminSchema = z.object({
  id: z.string(),
  email: z.string(),
  phone: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  role: z.string().optional(),
  is_super: z.boolean(),
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
}

export interface UpdateAdminBody {
  last_name?: string;
  first_name?: string;
}
