import z from 'zod';

export const BrokerSchema = z.object({
  id: z.string(),
  email: z.string(),
  phone: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  position: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export type BrokerType = z.infer<typeof BrokerSchema>;

export interface StaffFilters {
  page?: number;
  q?: string;
  status?: 'active' | 'inactive';
}

export interface CreateBrokerBody {
  email: string;
  phone: string;
  last_name: string;
  first_name: string;
  position?: string;
  password: string;
}

export interface UpdateBrokerBody {
  last_name?: string;
  first_name?: string;
  position?: string;
}
