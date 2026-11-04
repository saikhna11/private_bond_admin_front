import z from 'zod';

export const TransferStatusSchema = z.enum([
  'pending',
  'sent',
  'failed',
  'unknown',
]);
export type TransferStatus = z.infer<typeof TransferStatusSchema>;

export const TransferPurposeSchema = z.enum([
  'coupon',
  'principal',
  'refund',
  'other',
]);
export type TransferPurpose = z.infer<typeof TransferPurposeSchema>;

const money = z.coerce.string();

/** One line of Ulzii&Co's own account, as the bank statement reported it. */
export const BankStatementEntrySchema = z.object({
  id: z.string(),
  account_number: z.string(),
  bank_code: z.string(),
  currency: z.string(),
  record_no: z.number(),
  tran_date: z.string(),
  tran_time: z.string().optional(),
  code: z.number(),
  amount: money,
  balance: money,
  description: z.string().optional(),
  related_account: z.string().optional(),
  created_at: z.string(),
});
export type BankStatementEntryType = z.infer<typeof BankStatementEntrySchema>;

/** One outgoing payment to a client's registered account. */
export const BankTransferSchema = z.object({
  id: z.string(),
  transaction_number: z.string(),
  user_id: z.string(),
  purpose: TransferPurposeSchema,
  created_by: z.string(),
  from_account: z.string(),
  to_bank_code: z.string(),
  to_bank_name: z.string().optional(),
  to_account: z.string(),
  to_iban: z.string().optional(),
  to_holder_name: z.string(),
  amount: money,
  currency: z.string(),
  description: z.string().optional(),
  status: TransferStatusSchema,
  provider_uuid: z.string().optional(),
  error_code: z.string().optional(),
  statement_entry_id: z.string().optional(),
  reconciled_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type BankTransferType = z.infer<typeof BankTransferSchema>;

export const StatementSyncSchema = z.object({
  stored: z.number(),
});

export interface StatementFilters {
  page?: number;
  from?: string;
  to?: string;
  related_account?: string;
  q?: string;
}

export interface TransferFilters {
  page?: number;
  user_id?: string;
  status?: TransferStatus;
}

export interface CreateTransferBody {
  user_id: string;
  /** Defaults to other. */
  purpose?: TransferPurpose;
  amount: string;
  description?: string;
}

export const transferPurposeLabel: Record<TransferPurpose, string> = {
  coupon: 'Хүүгийн төлбөр',
  principal: 'Үндсэн төлбөр',
  refund: 'Буцаалт',
  other: 'Бусад',
};

export const transferStatusLabel: Record<TransferStatus, string> = {
  pending: 'Хүлээгдэж буй',
  sent: 'Илгээгдсэн',
  failed: 'Бүтэлгүй',
  unknown: 'Тодорхойгүй',
};
