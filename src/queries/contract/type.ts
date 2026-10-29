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

export interface ContractFilters {
  page?: number;
  status?: ContractStatus;
  template?: string;
  q?: string;
}
