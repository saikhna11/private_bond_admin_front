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

/**
 * How an active company account's balance compares: matched (the bank's balance is the
 * statement's and every transfer is proven), awaiting_statement (they agree, but transfers
 * wait for their line), statement_behind (they differ: sync the statement) or
 * bank_unavailable (the bank did not answer).
 */
export const BalanceStateSchema = z.enum([
  'matched',
  'awaiting_statement',
  'statement_behind',
  'bank_unavailable',
]);
export type BalanceState = z.infer<typeof BalanceStateSchema>;

/** One active company account's balance three ways: the bank's, the statement's, the transfers'. */
export const CompanyBalanceSchema = z.object({
  account: CompanyBankAccountSchema,
  /** The bank now; left out when it did not answer. */
  bank: z.object({ balance: money, hold: money, available: money }).optional(),
  bank_error: z.string().optional(),
  /** The newest stored statement line; left out before the first. */
  statement: z
    .object({
      balance: money,
      record_no: z.number(),
      tran_date: z.string(),
      tran_time: z.string().optional(),
      synced_at: z.string().optional(),
    })
    .optional(),
  /** Outbound transfers pending, sent or unknown that no statement line proves yet. */
  unreconciled_count: z.number(),
  unreconciled_amount: money,
  /** The bank's balance less the statement's. */
  difference: money,
  state: BalanceStateSchema,
});
export type CompanyBalanceType = z.infer<typeof CompanyBalanceSchema>;

export const CompanyBalanceListSchema = z.object({
  items: z
    .array(CompanyBalanceSchema)
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
  /** Why a refund gives the money back; set on every refund. */
  refund_reason: z.string().optional(),
  /** The row of contract_id's schedule a coupon or principal payout pays. */
  repayment_row_no: z.number().optional(),
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
  /** The transfers for one contract: its payments and refunds. */
  contract_id?: string;
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
  /** The contract a refund gives money back for; required for a refund. */
  contract_id?: string;
  /** Why a refund gives the money back; required for a refund. */
  refund_reason?: string;
  /** The schedule row a coupon or principal payout pays; required for one. */
  repayment_row_no?: number;
}

/** An edited schedule row a recalculation left as it was (bond.md 9.5). */
export const SkippedScheduleRowSchema = z.object({
  contract_id: z.string(),
  contract_no: z.string(),
  row_no: z.number(),
});

/** What entering or removing a holiday did to the schedules (bond.md 9.2). */
export const HolidayChangeSchema = z.object({
  holiday: z.lazy(() => HolidaySchema).optional(),
  recalculated: z.number(),
  skipped: z
    .array(SkippedScheduleRowSchema)
    .nullable()
    .transform((v) => v ?? []),
});
export type HolidayChangeType = z.infer<typeof HolidayChangeSchema>;

/** A public holiday: neither the bank nor a repayment works on it. */
export const HolidaySchema = z.object({
  date: z.string(),
  name: z.string(),
  /** The admin who entered it; left out for the ones seeded from Bond_Input. */
  created_by: z.string().optional(),
  created_at: z.string(),
});
export type HolidayType = z.infer<typeof HolidaySchema>;

export const HolidayListSchema = z.object({
  items: z
    .array(HolidaySchema)
    .nullable()
    .transform((v) => v ?? []),
});

/** What a day is for the bank. */
export const BusinessDaySchema = z.object({
  date: z.string(),
  /** Neither a Saturday, a Sunday nor a holiday. */
  business: z.boolean(),
  holiday_name: z.string().optional(),
  /** The first working day from date on: date itself when it works. */
  next_business_day: z.string(),
  /** Holidays of the year were entered; without, only weekends count. */
  year_known: z.boolean(),
});
export type BusinessDayType = z.infer<typeof BusinessDaySchema>;

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
