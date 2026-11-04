import * as z from 'zod';
import {
  type Frequency,
  FrequencySchema,
  frequencyMonths,
  type RateOptionBody,
} from '@/queries/bond/type';

/** The longest term an option offers, 10 years; the API takes no more. */
export const MAX_TERM_MONTHS = 120;

/** The months a term of frequency moves in: 1 at maturity, which pays once at any term. */
function stepOf(frequency: Frequency): number {
  return frequencyMonths[frequency] || 1;
}

/**
 * The terms an option of frequency may start or end on, from from on: its multiples, 3, 6,
 * 9… for quarterly, every month at maturity (bond.md 4.3).
 */
export function termChoices(frequency: Frequency, from = 1): number[] {
  const m = stepOf(frequency);
  const out: number[] = [];
  for (
    let t = Math.ceil(Math.max(from, 1) / m) * m;
    t <= MAX_TERM_MONTHS;
    t += m
  ) {
    out.push(t);
  }
  return out;
}

/** term moved up to the nearest one frequency takes, so a frequency change keeps the range. */
export function snapTerm(term: number, frequency: Frequency): number {
  const m = stepOf(frequency);
  return Math.min(
    Math.max(Math.ceil(term / m) * m, m),
    MAX_TERM_MONTHS - (MAX_TERM_MONTHS % m),
  );
}

const term = z
  .number({ message: 'Хугацаа сонгоно уу' })
  .int()
  .min(1, '1-ээс багагүй')
  .max(MAX_TERM_MONTHS, `${MAX_TERM_MONTHS}-аас ихгүй`);

/** A rate option as its form holds it; the API checks the same rules. */
export const rateOptionSchema = z
  .object({
    term_min_months: term,
    term_max_months: term,
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
    if (!onFrequency(o)) {
      ctx.addIssue({
        code: 'custom',
        path: ['term_max_months'],
        message: 'Хугацаа давтамжийн үржвэр сар байна',
      });
    }
  });

/**
 * Whether the option's range starts and ends on a term its frequency divides (bond.md 4.3):
 * quarterly 6-9, never 7-9. at_maturity takes any term.
 */
export function onFrequency(o: Omit<RateOptionBody, 'annual_rate'>): boolean {
  const m = frequencyMonths[o.interest_frequency];
  return (
    m === 0 || (o.term_min_months % m === 0 && o.term_max_months % m === 0)
  );
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
