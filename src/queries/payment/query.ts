import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  LinkResultSchema,
  PaymentContractSchema,
  PaymentCountsSchema,
  UnknownCreditSchema,
} from './type';

const UnknownPageSchema = pageSchema(UnknownCreditSchema);
const ContractPageSchema = pageSchema(PaymentContractSchema);

export const getPaymentCounts = () =>
  fetchAndValidate('payments/counts', PaymentCountsSchema);

export const getUnknownCredits = (page?: number) =>
  fetchAndValidate(
    `payments/unknown${listQuery({ page, size: PAGE_SIZE })}`,
    UnknownPageSchema,
  );

export const getPaymentContracts = (tab: 'short' | 'refund', page?: number) =>
  fetchAndValidate(
    `payments/contracts${listQuery({ tab, page, size: PAGE_SIZE })}`,
    ContractPageSchema,
  );

/** Applies a credit nothing matched to the order whose payment reference is reference. */
export const linkCredit = (id: string, reference: string) =>
  fetchAndValidate(`payments/entries/${id}/link`, LinkResultSchema, {
    method: 'POST',
    body: { reference },
  });

/** Records that a credit pays no order, for note. */
export const dismissCredit = (id: string, note: string) =>
  fetchAndValidate<void>(`payments/entries/${id}/dismiss`, undefined, {
    method: 'POST',
    body: { note },
  });

/** Records that the finance office sent a credit back from the bank by hand, for note. */
export const returnCredit = (id: string, note: string) =>
  fetchAndValidate<void>(`payments/entries/${id}/return`, undefined, {
    method: 'POST',
    body: { note },
  });
