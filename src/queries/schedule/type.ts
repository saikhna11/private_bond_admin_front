import z from 'zod';

/** A schedule row's state, read from the payout that pays it. */
export const ScheduleStateSchema = z.enum(['unpaid', 'paying', 'paid']);
export type ScheduleState = z.infer<typeof ScheduleStateSchema>;

export const scheduleStateLabel: Record<ScheduleState, string> = {
  unpaid: 'Төлөгдөөгүй',
  paying: 'Төлөгдөж байна',
  paid: 'Төлөгдсөн',
};

/** One payment of a purchase's repayment schedule (bond.md 7.10). Amounts are decimal strings. */
export const ScheduleRowSchema = z.object({
  no: z.number(),
  /** The day the rule gives. */
  scheduled_date: z.string(),
  /** The working day it is paid on. */
  pay_date: z.string(),
  days: z.number(),
  gross_interest: z.string(),
  tax: z.string(),
  net_interest: z.string(),
  principal: z.string(),
  /** What the holder receives: net_interest plus principal. */
  total: z.string(),
  tax_rate: z.string(),
  state: ScheduleStateSchema,
  /** An admin edited it; a recalculation leaves it as it is. */
  edited: z.boolean().optional(),
  payout_id: z.string().optional(),
});
export type ScheduleRowType = z.infer<typeof ScheduleRowSchema>;

export const ContractScheduleSchema = z.object({
  contract_id: z.string(),
  currency: z.string(),
  /** Not stored yet: what it would be if paid today. */
  projected: z.boolean(),
  /** Years it pays in that have no holiday entered. */
  missing_years: z
    .array(z.number())
    .nullable()
    .transform((v) => v ?? []),
  rows: z
    .array(ScheduleRowSchema)
    .nullable()
    .transform((v) => v ?? []),
});
export type ContractScheduleType = z.infer<typeof ContractScheduleSchema>;

/** One recorded edit of a schedule row. */
export const ScheduleEditSchema = z.object({
  row_no: z.number(),
  actor_id: z.string().optional(),
  actor_name: z.string(),
  reason: z.string(),
  before: z.record(z.string(), z.string()),
  after: z.record(z.string(), z.string()),
  created_at: z.string(),
});
export type ScheduleEditType = z.infer<typeof ScheduleEditSchema>;

export const ScheduleEditListSchema = z.object({
  items: z
    .array(ScheduleEditSchema)
    .nullable()
    .transform((v) => v ?? []),
});

export interface EditScheduleRowBody {
  pay_date: string;
  gross_interest: string;
  net_interest: string;
  principal: string;
  reason: string;
}

/** A schedule row due that no payout pays yet. */
export const DuePayoutSchema = z.object({
  contract_id: z.string(),
  contract_no: z.string(),
  bond_id: z.string(),
  bond_code: z.string(),
  row_no: z.number(),
  row_count: z.number(),
  scheduled_date: z.string(),
  pay_date: z.string(),
  net_interest: z.string(),
  principal: z.string(),
  total: z.string(),
  currency: z.string(),
  holder_id: z.string(),
  repayment_bank_name: z.string(),
  repayment_account_no: z.string(),
  repayment_iban: z.string(),
  repayment_owner: z.string(),
  /** An earlier payout of it failed. */
  failed_before: z.boolean(),
});
export type DuePayoutType = z.infer<typeof DuePayoutSchema>;

/** One pay date of a bond's issuer schedule (bond.md 8.2). */
export const IssuerScheduleDaySchema = z.object({
  pay_date: z.string(),
  investors: z.number(),
  gross_interest: z.string(),
  tax: z.string(),
  net_interest: z.string(),
  principal: z.string(),
  /** What the issuer transfers: net_interest plus principal. */
  total: z.string(),
  /** How many of the investors' rows were paid out. */
  paid: z.number(),
});
export type IssuerScheduleDayType = z.infer<typeof IssuerScheduleDaySchema>;

export const IssuerScheduleSchema = z.object({
  bond_id: z.string(),
  bond_code: z.string(),
  bond_name: z.string(),
  currency: z.string(),
  bond_issuer_id: z.string(),
  issuer_cutoff: z.string(),
  days: z
    .array(IssuerScheduleDaySchema)
    .nullable()
    .transform((v) => v ?? []),
});
export type IssuerScheduleType = z.infer<typeof IssuerScheduleSchema>;

export const IssuerScheduleListSchema = z.object({
  items: z
    .array(IssuerScheduleSchema)
    .nullable()
    .transform((v) => v ?? []),
});
