import z from 'zod';
import { type Currency, CurrencySchema } from '@/queries/issuer/type';

export const TransferStatusSchema = z.enum([
  'pending',
  'sent',
  'failed',
  'unknown',
  'unmatched',
  'short_paid',
  'over_paid',
  'matched',
]);
export type TransferStatus = z.infer<typeof TransferStatusSchema>;

export const TransferPurposeSchema = z.enum([
  'coupon',
  'principal',
  'refund',
  'payout',
  'other',
  'bond_purchase',
]);
export type TransferPurpose = z.infer<typeof TransferPurposeSchema>;

export const RecipientTypeSchema = z.enum(['client', 'issuer']);
export type RecipientType = z.infer<typeof RecipientTypeSchema>;

const money = z.coerce.string();

/** One of Ulzii&Co's own accounts: transfers leave from it and its statement is read. */
export const CompanyBankAccountSchema = z.object({
  id: z.string(),
  bank_name: z.string(),
  account_number: z.string(),
  iban: z.string(),
  bank_code: z.string(),
  currency: CurrencySchema,
  account_name: z.string(),
  /** The account its currency's transfers leave from unless one is picked. */
  is_default: z.boolean(),
  /** An inactive account sends nothing and its statement is no longer read. */
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type CompanyBankAccountType = z.infer<typeof CompanyBankAccountSchema>;

export const CompanyBankAccountListSchema = z.object({
  items: z
    .array(CompanyBankAccountSchema)
    .nullish()
    .transform((v) => v ?? []),
});

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

/** One outgoing payment to a client's or a bond issuer's registered account. */
export const TransferDirectionSchema = z.enum(['outbound', 'inbound']);
export type TransferDirection = z.infer<typeof TransferDirectionSchema>;

export const BankTransferSchema = z.object({
  id: z.string(),
  /** outbound: the company pays; inbound: a client pays the company for a bond. */
  direction: TransferDirectionSchema,
  /** The contract an inbound transfer pays for. */
  contract_id: z.string().optional(),
  /** The text the statement line carries. */
  reference_code: z.string(),
  transaction_number: z.string(),
  recipient_type: RecipientTypeSchema,
  /** The client paid, when recipient_type is client. */
  user_id: z.string().optional(),
  /** The bond issuer paid, when recipient_type is issuer. */
  bond_issuer_id: z.string().optional(),
  purpose: TransferPurposeSchema,
  /** The admin who sent an outbound transfer. */
  created_by: z.string().optional(),
  /** The company account number it left from. */
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
  /** A company account id; the default MNT account when left out. */
  account_id?: string;
  from?: string;
  to?: string;
  related_account?: string;
  q?: string;
}

export interface TransferFilters {
  page?: number;
  user_id?: string;
  bond_issuer_id?: string;
  /** A company account number. */
  from_account?: string;
  status?: TransferStatus;
}

/** Exactly one of user_id and bond_issuer_id. */
export interface CreateTransferBody {
  user_id?: string;
  bond_issuer_id?: string;
  /** One of the recipient's accounts; its default in the currency when left out. */
  to_account_id?: string;
  /** An active company account of the currency; its default when left out. */
  from_account_id?: string;
  currency?: Currency;
  /** Defaults to other. */
  purpose?: TransferPurpose;
  amount: string;
  description?: string;
}

export interface CreateCompanyAccountBody {
  bank_name: string;
  account_number: string;
  iban: string;
  /** MNT when left out. */
  currency?: Currency;
  account_name: string;
  is_default?: boolean;
}

/** Number, IBAN and currency never change after creation. */
export interface UpdateCompanyAccountBody {
  bank_name?: string;
  account_name?: string;
  is_active?: boolean;
}

export const recipientTypeLabel: Record<RecipientType, string> = {
  client: 'Харилцагч',
  issuer: 'Бонд гаргагч',
};

export const transferPurposeLabel: Record<TransferPurpose, string> = {
  coupon: 'Хүүгийн төлбөр',
  principal: 'Үндсэн төлбөр',
  refund: 'Буцаалт',
  payout: 'Бондын хөрөнгө олгох',
  other: 'Бусад',
  bond_purchase: 'Бонд худалдан авалт',
};

export const transferStatusLabel: Record<TransferStatus, string> = {
  pending: 'Хүлээгдэж буй',
  sent: 'Илгээгдсэн',
  failed: 'Бүтэлгүй',
  unknown: 'Тодорхойгүй',
  unmatched: 'Тулгагдаагүй',
  short_paid: 'Дутуу төлсөн',
  over_paid: 'Илүү төлсөн',
  matched: 'Тулгагдсан',
};
