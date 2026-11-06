import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  type BondBody,
  type BondDetailType,
  CurrencySchema,
  InterestMethodSchema,
  PURCHASE_UNITS,
  type RateOptionBody,
} from '@/queries/bond/type';
import {
  OVERLAP_MESSAGE,
  overlaps,
  rateOptionSchema,
} from './rate-option-rules';

const amount = z.string().regex(/^\d{1,26}$/, 'Бүхэл тоо оруулна уу');
const percent = z
  .string()
  .trim()
  .regex(/^\d{1,15}(\.\d{1,6})?$/, 'Хувь оруулна уу, жишээ нь 0.1');

const schema = z
  .object({
    bond_issuer_id: z.string().min(1, 'Бонд гаргагч сонгоно уу'),
    code: z
      .string()
      .trim()
      .regex(
        /^[A-Za-zА-Яа-яЁёӨөҮү0-9-]{1,10}$/,
        '10 хүртэл үсэг, тоо, зураас (латин эсвэл кирилл)',
      ),
    name: z
      .string()
      .trim()
      .min(1, 'Нэр оруулна уу')
      .max(50, '50 тэмдэгтээс ихгүй'),
    currency: CurrencySchema,
    total_amount: amount,
    min_purchase: amount,
    purchase_unit: z.enum(PURCHASE_UNITS),
    investor_cap: amount.or(z.literal('')),
    sale_start: z.string().min(1, 'Огноо сонгоно уу'),
    sale_end: z.string().min(1, 'Огноо сонгоно уу'),
    interest_method: InterestMethodSchema,
    issuer_cutoff: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'ЦЦ:ММ хэлбэрээр'),
    prospectus: z.string().max(20000, '20,000 тэмдэгтээс ихгүй'),
    has_guarantee: z.boolean(),
    exit_fee_rate: percent,
    penalty_rate: percent,
    rate_options: z.array(rateOptionSchema),
  })
  .superRefine((v, ctx) => {
    const unit = BigInt(v.purchase_unit);
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });
    const ok = (s: string) => /^\d+$/.test(s);
    if (ok(v.min_purchase)) {
      const min = BigInt(v.min_purchase);
      if (min === 0n || min % unit !== 0n) {
        issue(
          'min_purchase',
          'Нэгжийн үржвэртэй багагүй болон түүнээс их байна',
        );
      }
      if (ok(v.total_amount)) {
        const total = BigInt(v.total_amount);
        if (total < min || total % unit !== 0n) {
          issue(
            'total_amount',
            'Нэгжийн үржвэр, хамгийн бага дүнгээс багагүй болон түүнээс их байна',
          );
        }
      }
      if (ok(v.investor_cap)) {
        const cap = BigInt(v.investor_cap);
        if (cap !== 0n && (cap < min || cap % unit !== 0n)) {
          issue(
            'investor_cap',
            'Нэгжийн үржвэр, хамгийн бага дүнгээс багагүй болон түүнээс их байна',
          );
        }
      }
    }
    if (v.sale_end && v.sale_end < v.sale_start) {
      issue('sale_end', 'Эхлэх огнооноос өмнө байж болохгүй');
    }
    v.rate_options.forEach((o, i) => {
      if (v.rate_options.slice(0, i).some((p) => overlaps(o, p))) {
        ctx.addIssue({
          code: 'custom',
          path: ['rate_options', i, 'term_max_months'],
          message: OVERLAP_MESSAGE,
        });
      }
    });
  });

export type BondFormValues = z.infer<typeof schema>;

/** The form's names of the API's body fields, for its field errors. */
export const bondFieldNames = {
  bond_issuer_id: 'bond_issuer_id',
  code: 'code',
  name: 'name',
  total_amount: 'total_amount',
  min_purchase: 'min_purchase',
  purchase_unit: 'purchase_unit',
  investor_cap: 'investor_cap',
  sale_start: 'sale_start',
  sale_end: 'sale_end',
  issuer_cutoff: 'issuer_cutoff',
  prospectus: 'prospectus',
  exit_fee_rate: 'exit_fee_rate',
  penalty_rate: 'penalty_rate',
} as const;

/** A whole amount as the API writes it, "1500000000.00" or "1500000000", as digits. */
function digits(s: string | undefined): string {
  return s ? s.replace(/\.0+$/, '') : '';
}

/** The form of a new bond, with one empty rate option, or of bond b's terms. */
export function bondDefaults(b?: BondDetailType): BondFormValues {
  return {
    bond_issuer_id: b?.bond_issuer_id ?? '',
    code: b?.code ?? '',
    name: b?.name ?? '',
    currency: b?.currency ?? 'MNT',
    total_amount: digits(b?.total_amount),
    min_purchase: digits(b?.min_purchase),
    purchase_unit:
      PURCHASE_UNITS.find((u) => u === digits(b?.purchase_unit)) ?? '500000',
    investor_cap: digits(b?.investor_cap),
    sale_start: b?.sale_start ?? '',
    sale_end: b?.sale_end ?? '',
    interest_method: b?.interest_method ?? 'actual_days',
    issuer_cutoff: b?.issuer_cutoff ?? '11:00',
    prospectus: b?.prospectus ?? '',
    has_guarantee: b?.has_guarantee ?? false,
    exit_fee_rate: b?.exit_fee_rate ?? '0.1',
    penalty_rate: b?.penalty_rate ?? '0.1',
    rate_options: b ? [] : [emptyRateOption()],
  };
}

export function emptyRateOption(): BondFormValues['rate_options'][number] {
  return {
    term_min_months: 12,
    term_max_months: 12,
    interest_frequency: 'monthly',
    annual_rate: '',
  };
}

/** The bond's body; an empty cap or last day of sales is left out, meaning none. */
export function bondBody(v: BondFormValues): BondBody {
  return {
    bond_issuer_id: v.bond_issuer_id,
    code: v.code,
    name: v.name,
    currency: v.currency,
    total_amount: v.total_amount,
    min_purchase: v.min_purchase,
    purchase_unit: v.purchase_unit,
    investor_cap: v.investor_cap || undefined,
    sale_start: v.sale_start,
    sale_end: v.sale_end || undefined,
    interest_method: v.interest_method,
    issuer_cutoff: v.issuer_cutoff,
    prospectus: v.prospectus,
    has_guarantee: v.has_guarantee,
    exit_fee_rate: v.exit_fee_rate,
    penalty_rate: v.penalty_rate,
  };
}

export function rateOptionBodies(v: BondFormValues): RateOptionBody[] {
  return v.rate_options;
}

/** A bond's form: a new one's with its first rate options, or bond b's terms. */
export function useBondForm(b?: BondDetailType) {
  return useForm<BondFormValues>({
    resolver: zodResolver(schema),
    defaultValues: bondDefaults(b),
  });
}
