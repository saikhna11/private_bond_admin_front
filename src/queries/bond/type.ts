import z from 'zod';

export const CurrencySchema = z.enum(['MNT', 'USD']);
export type Currency = z.infer<typeof CurrencySchema>;

export const InterestMethodSchema = z.enum(['actual_days', 'equal']);
export type InterestMethod = z.infer<typeof InterestMethodSchema>;

export const interestMethodLabel: Record<InterestMethod, string> = {
  actual_days: 'Хоног',
  equal: 'Тэнцүү',
};

export const interestMethodHint: Record<InterestMethod, string> = {
  actual_days: 'Үе бүрийн бодит хоногоор тооцно',
  equal: 'Нийт хүүг төлбөр бүрт тэнцүү хуваана',
};

export const FrequencySchema = z.enum([
  'monthly',
  'bimonthly',
  'quarterly',
  'semi_annual',
  'annual',
  'at_maturity',
]);
export type Frequency = z.infer<typeof FrequencySchema>;

export const frequencyLabel: Record<Frequency, string> = {
  monthly: 'Сар бүр',
  bimonthly: '2 сар тутам',
  quarterly: 'Улирал тутам',
  semi_annual: 'Хагас жил тутам',
  annual: 'Жил тутам',
  at_maturity: 'Хугацааны эцэст',
};

/** How many months apart a frequency pays; 0 for at_maturity, which pays once. */
export const frequencyMonths: Record<Frequency, number> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  semi_annual: 6,
  annual: 12,
  at_maturity: 0,
};

export const SalesStatusSchema = z.enum([
  'draft',
  'upcoming',
  'selling',
  'paused',
  'closed',
  'rejected',
]);
export type SalesStatus = z.infer<typeof SalesStatusSchema>;

export const salesStatusLabel: Record<SalesStatus, string> = {
  draft: 'Ноорог',
  upcoming: 'Удахгүй',
  selling: 'Захиалга авч буй',
  paused: 'Түр хаасан',
  closed: 'Хаагдсан',
  rejected: 'Татгалзсан',
};

/**
 * Where staff have a bond: a draft customers never see, active (sold by its dates), paused,
 * closed for good, or rejected, an issuer's request staff turned down (final).
 */
export const ManualStateSchema = z.enum([
  'draft',
  'active',
  'paused',
  'closed',
  'rejected',
]);
export type ManualState = z.infer<typeof ManualStateSchema>;

export const PURCHASE_UNITS = ['100000', '500000', '1000000'] as const;

export const BondFileKindSchema = z.enum(['prospectus', 'cover']);
export type BondFileKind = z.infer<typeof BondFileKindSchema>;

/** The live prospectus files a bond keeps (bond.md 3.2). */
export const MAX_PROSPECTUS_FILES = 5;

/**
 * A bond's terms (bond.md 3.2) and its sales status today. Amounts are decimal strings in its
 * currency, rates percents. investor_cap is left out for no cap and sale_end while sales run
 * until the bond is sold out or closed.
 */
export const BondSchema = z.object({
  id: z.uuid(),
  bond_issuer_id: z.string(),
  bond_issuer_name: z.string(),
  code: z.string(),
  name: z.string(),
  currency: CurrencySchema,
  total_amount: z.string(),
  min_purchase: z.string(),
  purchase_unit: z.string(),
  investor_cap: z.string().optional(),
  sale_start: z.string(),
  sale_end: z.string().optional(),
  interest_method: InterestMethodSchema,
  issuer_cutoff: z.string(),
  prospectus: z.string(),
  has_guarantee: z.boolean(),
  exit_fee_rate: z.string(),
  penalty_rate: z.string(),
  manual_state: ManualStateSchema,
  sales_status: SalesStatusSchema,
  /** When an issuer's member requested it from the issuer portal; left out for staff's. */
  requested_at: z.string().optional(),
  requester_name: z.string().optional(),
  reject_reason: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type BondType = z.infer<typeof BondSchema>;

/** One row of a bond's rate matrix (bond.md 4). */
export const RateOptionSchema = z.object({
  id: z.uuid(),
  term_min_months: z.number(),
  term_max_months: z.number(),
  interest_frequency: FrequencySchema,
  annual_rate: z.string(),
});
export type RateOptionType = z.infer<typeof RateOptionSchema>;

export const BondFileSchema = z.object({
  id: z.uuid(),
  kind: BondFileKindSchema,
  file_name: z.string(),
  content_type: z.string(),
  size_bytes: z.number(),
  created_at: z.string(),
});
export type BondFileType = z.infer<typeof BondFileSchema>;

/** How far a bond's purchases were repaid (bond.md 5.2), apart from its sales. */
export const RepaymentStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'settled',
]);
export type RepaymentStatus = z.infer<typeof RepaymentStatusSchema>;

export const repaymentStatusLabel: Record<RepaymentStatus, string> = {
  not_started: 'Эхлээгүй',
  in_progress: 'Төлөлт явагдаж буй',
  settled: 'Бүрэн барагдсан',
};

export const BondDetailSchema = BondSchema.extend({
  rate_options: z.array(RateOptionSchema),
  files: z.array(BondFileSchema),
  repayment_status: RepaymentStatusSchema.optional(),
});
export type BondDetailType = z.infer<typeof BondDetailSchema>;

export interface BondFilters {
  page?: number;
  q?: string;
  /** Any part of the issuer's name. */
  issuer?: string;
  /** Only the bonds in this sales status today. */
  status?: SalesStatus;
  /** The first and the last day it was registered. */
  from?: string;
  to?: string;
}

/** What an admin writes of a rate option. */
export interface RateOptionBody {
  term_min_months: number;
  term_max_months: number;
  interest_frequency: Frequency;
  annual_rate: string;
}

/** What an admin writes of a bond; left-out cap and last day of sales mean none. */
export interface BondBody {
  bond_issuer_id: string;
  code: string;
  name: string;
  currency: Currency;
  total_amount: string;
  min_purchase: string;
  purchase_unit: string;
  investor_cap?: string;
  sale_start: string;
  sale_end?: string;
  interest_method: InterestMethod;
  issuer_cutoff: string;
  prospectus: string;
  has_guarantee: boolean;
  exit_fee_rate: string;
  penalty_rate: string;
}

/** A rate option's terms as staff read them: «12-18 сар», «12 сар». */
export function termLabel(o: {
  term_min_months: number;
  term_max_months: number;
}): string {
  return o.term_min_months === o.term_max_months
    ? `${o.term_min_months} сар`
    : `${o.term_min_months}-${o.term_max_months} сар`;
}
