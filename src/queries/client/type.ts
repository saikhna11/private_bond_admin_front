import z from 'zod';

export const ClientTypeSchema = z.enum([
  'customer',
  'foreign',
  'organization',
  'org_member',
]);
export const ReviewStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export type ClientType = z.infer<typeof ClientTypeSchema>;
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const ClientSummarySchema = z.object({
  id: z.string(),
  type: ClientTypeSchema,
  status: ReviewStatusSchema,
  is_active: z.boolean(),
  email: z.string().optional(),
  phone: z.string().optional(),
  display_name: z.string(),
  register_number: z.string().optional(),
  profile_complete: z.boolean(),
  created_at: z.string(),
});

export const BankAccountSchema = z.object({
  bank_name: z.string(),
  account_number: z.string(),
  iban: z.string(),
  holder_last_name: z.string(),
  holder_first_name: z.string(),
});

export const TaxExemptStatusSchema = z.enum([
  'requested',
  'approved',
  'rejected',
]);
export type TaxExemptStatus = z.infer<typeof TaxExemptStatusSchema>;

export const ClientSchema = z.object({
  id: z.string(),
  type: ClientTypeSchema,
  status: ReviewStatusSchema,
  is_active: z.boolean(),
  email: z.string().optional(),
  phone: z.string().optional(),
  phone_secondary: z.string().optional(),
  address: z.string().optional(),
  phone_verified: z.boolean(),
  email_verified: z.boolean(),
  has_password: z.boolean(),
  profile_complete: z.boolean(),
  last_name: z.string().optional(),
  first_name: z.string().optional(),
  register_number: z.string().optional(),
  nationality: z.string().optional(),
  passport_number: z.string().optional(),
  name: z.string().optional(),
  activity: z.string().optional(),
  tax_exempt_status: TaxExemptStatusSchema.optional(),
  tax_exempt_reviewed_at: z.string().optional(),
  bank_account: BankAccountSchema.optional(),
  org_id: z.string().optional(),
  org_name: z.string().optional(),
  position: z.string().optional(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.string().optional(),
  reject_reason: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** An organization's officer; its id is also the officer's client id. */
export const MemberSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  position: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export type ClientSummaryType = z.infer<typeof ClientSummarySchema>;
export type ClientDetailType = z.infer<typeof ClientSchema>;
export type MemberType = z.infer<typeof MemberSchema>;

export interface ClientFilters {
  page?: number;
  q?: string;
  type?: ClientType;
  status?: ReviewStatus;
  active?: 'active' | 'inactive';
}

export const clientTypeLabel: Record<ClientType, string> = {
  customer: 'Монгол иргэн',
  foreign: 'Гадаад иргэн',
  organization: 'Байгууллага',
  org_member: 'Байгууллагын албан тушаалтан',
};
