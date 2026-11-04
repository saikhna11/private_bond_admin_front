import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  BankStatementEntrySchema,
  BankTransferSchema,
  type CreateTransferBody,
  type StatementFilters,
  StatementSyncSchema,
  type TransferFilters,
} from './type';

const StatementPageSchema = pageSchema(BankStatementEntrySchema);
const TransferPageSchema = pageSchema(BankTransferSchema);

export const getStatement = (f: StatementFilters) =>
  fetchAndValidate(
    `bank/statement${listQuery({
      page: f.page,
      size: PAGE_SIZE,
      from: f.from,
      to: f.to,
      related_account: f.related_account,
      q: f.q,
    })}`,
    StatementPageSchema,
  );

export const syncStatement = () =>
  fetchAndValidate('bank/statement/sync', StatementSyncSchema, {
    method: 'POST',
  });

export const getTransfers = (f: TransferFilters) =>
  fetchAndValidate(
    `bank/transfers${listQuery({
      page: f.page,
      size: PAGE_SIZE,
      user_id: f.user_id,
      status: f.status,
    })}`,
    TransferPageSchema,
  );

export const getTransfer = (id: string) =>
  fetchAndValidate(`bank/transfers/${id}`, BankTransferSchema);

/**
 * The Idempotency-Key names the payment: sending the same request again returns the
 * recorded transfer instead of paying twice.
 */
export const createTransfer = (
  body: CreateTransferBody,
  idempotencyKey: string,
) =>
  fetchAndValidate('bank/transfers', BankTransferSchema, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body,
  });
