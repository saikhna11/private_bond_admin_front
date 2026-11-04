import * as z from 'zod';
import {
  FrequencySchema,
  frequencyMonths,
  type RateOptionBody,
} from '@/queries/bond/type';

/** A rate option as its form holds it; the API checks the same rules. */
export const rateOptionSchema = z
  .object({
    term_min_months: z
      .number({ message: 'Хугацаа оруулна уу' })
      .int('Бүхэл сар оруулна уу')
      .min(1, '1-ээс багагүй')
      .max(600, '600-аас ихгүй'),
    term_max_months: z
      .number({ message: 'Хугацаа оруулна уу' })
      .int('Бүхэл сар оруулна уу')
      .min(1, '1-ээс багагүй')
      .max(600, '600-аас ихгүй'),
    interest_frequency: FrequencySchema,
    annual_rate: z
      .string()
      .trim()
      .regex(/^\d{1,3}(\.\d{1,2})?$/, '20.50 гэх мэт, 2 хүртэлх бутархай')
      .refine((v) => Number(v) > 0, '0-ээс их байна'),
  })
  .superRefine((o, ctx) => {
    if (o.term_max_months < o.term_min_months) {
      ctx.addIssue({
        code: 'custom',
        path: ['term_max_months'],
        message: 'Доод хугацаанаас багагүй',
      });
      return;
    }
    if (!holdsATerm(o)) {
      ctx.addIssue({
        code: 'custom',
        path: ['term_max_months'],
        message: 'Мужид давтамжид хуваагдах хугацаа алга',
      });
    }
  });

/**
 * Whether the option's range holds a term its frequency divides (bond.md 4.3): a quarterly
 * 7-8 months pays no whole quarter. at_maturity takes any term.
 */
export function holdsATerm(o: Omit<RateOptionBody, 'annual_rate'>): boolean {
  const m = frequencyMonths[o.interest_frequency];
  return m === 0 || Math.ceil(o.term_min_months / m) * m <= o.term_max_months;
}

/** Whether two options of one frequency share a month, both ends included (bond.md 4.4). */
export function overlaps(
  a: Omit<RateOptionBody, 'annual_rate'>,
  b: Omit<RateOptionBody, 'annual_rate'>,
): boolean {
  return (
    a.interest_frequency === b.interest_frequency &&
    a.term_min_months <= b.term_max_months &&
    b.term_min_months <= a.term_max_months
  );
}

export const OVERLAP_MESSAGE = 'Ижил давтамжтай нөхцөлтэй давхцаж байна';
