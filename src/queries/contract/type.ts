import z from 'zod';
import { LanguageSchema, OwnershipTypeSchema } from '@/queries/template/type';

export const ContractStatusSchema = z.enum([
  'pending_signature',
  'rendering',
  'signed',
  'cancelled',
  'expired',
  'failed',
]);
export type ContractStatus = z.infer<typeof ContractStatusSchema>;

export const contractStatusLabel: Record<ContractStatus, string> = {
  pending_signature: 'Гарын үсэг хүлээж буй',
  rendering: 'PDF бэлтгэж буй',
  signed: 'Байгуулсан',
  cancelled: 'Татгалзсан',
  expired: 'Хугацаа дууссан',
  failed: 'Алдаатай',
};

/** A contract in the admins' list, with its template and holder (the first party). */
export const AdminContractSchema = z.object({
  id: z.guid(),
  contract_no: z.string().optional(),
  status: ContractStatusSchema,
  ownership_type: OwnershipTypeSchema,
  principal_amount: z.string(),
  currency: z.string(),
  contract_date: z.string(),
  signed_at: z.string().optional(),
  created_at: z.string(),
  template: z.object({
    id: z.guid(),
    name: z.string(),
    ttd: z.boolean(),
    language: LanguageSchema,
  }),
  holder: z.object({
    last_name: z.string(),
    first_name: z.string(),
    register_no: z.string(),
  }),
});
export type AdminContractType = z.infer<typeof AdminContractSchema>;

export const PartyTypeSchema = z.enum([
  'holder',
  'co_holder',
  'guardian',
  'minor',
  'organization',
]);
export type PartyType = z.infer<typeof PartyTypeSchema>;

export const partyTypeLabel: Record<PartyType, string> = {
  holder: 'Эзэмшигч',
  co_holder: 'Хамтран эзэмшигч',
  guardian: 'Асран хамгаалагч',
  minor: 'Хүүхэд',
  organization: 'Байгууллага',
};

export const InterestFrequencySchema = z.enum([
  'monthly',
  'quarterly',
  'semi_annual',
  'annual',
  'at_maturity',
]);
export type InterestFrequency = z.infer<typeof InterestFrequencySchema>;

export const interestFrequencyLabel: Record<InterestFrequency, string> = {
  monthly: 'Сар бүр',
  quarterly: 'Улирал бүр',
  semi_annual: 'Хагас жил тутам',
  annual: 'Жил бүр',
  at_maturity: 'Хугацааны эцэст',
};

/** A person or organization the contract names, and whether they signed or declined. */
export const ContractPartySchema = z.object({
  id: z.guid(),
  position: z.number(),
  type: PartyTypeSchema,
  signs: z.boolean(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  organization_name: z.string().optional(),
  register_no: z.string(),
  phone: z.string().optional(),
  signed_at: z.string().optional(),
  declined_at: z.string().optional(),
});
export type ContractPartyType = z.infer<typeof ContractPartySchema>;

/** A contract as an admin reads it: terms, state, template, parties and rendering. */
export const AdminContractDetailSchema = z.object({
  id: z.guid(),
  status: ContractStatusSchema,
  contract_no: z.string().optional(),
  ownership_type: OwnershipTypeSchema,
  contract_date: z.string(),
  start_date: z.string(),
  maturity_date: z.string(),
  currency: z.string(),
  principal_amount: z.string(),
  annual_rate: z.string(),
  tax_rate: z.string(),
  term_months: z.number(),
  interest_frequency: InterestFrequencySchema,
  repayment_bank_name: z.string(),
  repayment_account_no: z.string(),
  repayment_iban: z.string(),
  repayment_owner: z.string(),
  signature_deadline: z.string().optional(),
  cancel_reason: z.enum(['declined', 'expired']).optional(),
  cancelled_at: z.string().optional(),
  signed_at: z.string().optional(),
  created_at: z.string(),
  template: z.object({
    id: z.guid(),
    name: z.string(),
    ttd: z.boolean(),
    language: LanguageSchema,
  }),
  parties: z.array(ContractPartySchema),
  render_attempts: z.number(),
  render_error: z.string().optional(),
});
export type AdminContractDetailType = z.infer<typeof AdminContractDetailSchema>;

export interface ContractFilters {
  page?: number;
  status?: ContractStatus;
  template?: string;
  q?: string;
}
