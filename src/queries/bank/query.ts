import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  BankStatementEntrySchema,
  BankTransferSchema,
  BusinessDaySchema,
  CompanyBalanceListSchema,
  CompanyBankAccountListSchema,
  CompanyBankAccountSchema,
  type CreateCompanyAccountBody,
  type CreateTransferBody,
  HolidayChangeSchema,
  HolidayListSchema,
  type StatementFilters,
  StatementSyncSchema,
  type TransferFilters,
  type UpdateCompanyAccountBody,
} from './type';

const StatementPageSchema = pageSchema(BankStatementEntrySchema);
const TransferPageSchema = pageSchema(BankTransferSchema);

export const getStatement = (f: StatementFilters) =>
  fetchAndValidate(
    `bank/statement${listQuery({
      page: f.page,
      size: PAGE_SIZE,
      account_id: f.account_id,
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

/** Every company account; activeOnly leaves out the inactive ones. */
export const getCompanyAccounts = (activeOnly?: boolean) =>
  fetchAndValidate(
    `bank/company-accounts${listQuery({ active_only: activeOnly ? 'true' : undefined })}`,
    CompanyBankAccountListSchema,
  );

/** Every active company account's balance: the bank's now, the statement's and the open transfers. */
export const getCompanyBalances = () =>
  fetchAndValidate('bank/company-accounts/balances', CompanyBalanceListSchema);

/** Super admins only. */
export const createCompanyAccount = (body: CreateCompanyAccountBody) =>
  fetchAndValidate('bank/company-accounts', CompanyBankAccountSchema, {
    method: 'POST',
    body,
  });

/** Super admins only. */
export const updateCompanyAccount = (
  id: string,
  body: UpdateCompanyAccountBody,
) =>
  fetchAndValidate(`bank/company-accounts/${id}`, CompanyBankAccountSchema, {
    method: 'PATCH',
    body,
  });

/** Super admins only. */
export const setDefaultCompanyAccount = (id: string) =>
  fetchAndValidate(
    `bank/company-accounts/${id}/default`,
    CompanyBankAccountSchema,
    { method: 'POST' },
  );

/** Super admins only; a used account answers bank.company_account_in_use. */
export const deleteCompanyAccount = (id: string) =>
  fetchAndValidate(`bank/company-accounts/${id}`, undefined, {
    method: 'DELETE',
  });

export const getTransfers = (f: TransferFilters) =>
  fetchAndValidate(
    `bank/transfers${listQuery({
      page: f.page,
      size: PAGE_SIZE,
      user_id: f.user_id,
      bond_issuer_id: f.bond_issuer_id,
      from_account: f.from_account,
      status: f.status,
      contract_id: f.contract_id,
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

export const getHolidays = (year: number) =>
  fetchAndValidate(`bank/holidays${listQuery({ year })}`, HolidayListSchema);

/** A weekday only (holiday.weekend); one per day (holiday.exists). */
export const createHoliday = (date: string, name: string) =>
  fetchAndValidate('bank/holidays', HolidayChangeSchema, {
    method: 'POST',
    body: { date, name },
  });

/** The unpaid schedule rows are worked out again, as on entering one. */
export const deleteHoliday = (date: string) =>
  fetchAndValidate(`bank/holidays/${date}`, HolidayChangeSchema, {
    method: 'DELETE',
  });

/** Today in Ulaanbaatar when date is left out. */
export const getBusinessDay = (date?: string) =>
  fetchAndValidate(
    `bank/business-day${listQuery({ date })}`,
    BusinessDaySchema,
  );
