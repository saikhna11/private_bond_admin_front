import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  type CreateIssuerBody,
  type IssuerBankAccountBody,
  IssuerBankAccountSchema,
  type IssuerFilters,
  type IssuerMemberBody,
  IssuerSchema,
  IssuerSummarySchema,
  type UpdateIssuerBody,
  type UpdateIssuerMemberBody,
} from './type';

export const getIssuers = (f: IssuerFilters) =>
  fetchAndValidate(
    `issuers${listQuery({ page: f.page, size: PAGE_SIZE, q: f.q })}`,
    pageSchema(IssuerSummarySchema),
  );

export const getIssuer = (id: string) =>
  fetchAndValidate(`issuers/${id}`, IssuerSchema);

export const createIssuer = (body: CreateIssuerBody) =>
  fetchAndValidate('issuers', IssuerSchema, { method: 'POST', body });

export const updateIssuer = (id: string, body: UpdateIssuerBody) =>
  fetchAndValidate(`issuers/${id}`, IssuerSchema, { method: 'PATCH', body });

export const deleteIssuer = (id: string) =>
  fetchAndValidate(`issuers/${id}`, undefined, { method: 'DELETE' });

export const addIssuerMember = (id: string, body: IssuerMemberBody) =>
  fetchAndValidate(`issuers/${id}/members`, IssuerSchema, {
    method: 'POST',
    body,
  });

const member = (id: string, memberId: string) =>
  `issuers/${id}/members/${memberId}`;

export const updateIssuerMember = (
  id: string,
  memberId: string,
  body: UpdateIssuerMemberBody,
) =>
  fetchAndValidate(member(id, memberId), IssuerSchema, {
    method: 'PATCH',
    body,
  });

export const removeIssuerMember = (id: string, memberId: string) =>
  fetchAndValidate(member(id, memberId), IssuerSchema, { method: 'DELETE' });

export const setIssuerDirector = (id: string, memberId: string) =>
  fetchAndValidate(`${member(id, memberId)}/director`, IssuerSchema, {
    method: 'POST',
  });

export const blockIssuerMember = (id: string, memberId: string) =>
  fetchAndValidate(`${member(id, memberId)}/block`, undefined, {
    method: 'POST',
  });

export const unblockIssuerMember = (id: string, memberId: string) =>
  fetchAndValidate(`${member(id, memberId)}/unblock`, undefined, {
    method: 'POST',
  });

export const resetIssuerMemberPassword = (
  id: string,
  memberId: string,
  password: string,
) =>
  fetchAndValidate(`${member(id, memberId)}/password`, undefined, {
    method: 'POST',
    body: { password },
  });

const bankAccount = (id: string, accountId: string) =>
  `issuers/${id}/bank-accounts/${accountId}`;

export const addIssuerBankAccount = (id: string, body: IssuerBankAccountBody) =>
  fetchAndValidate(`issuers/${id}/bank-accounts`, IssuerSchema, {
    method: 'POST',
    body,
  });

export const updateIssuerBankAccount = (
  id: string,
  accountId: string,
  body: IssuerBankAccountBody,
) =>
  fetchAndValidate(bankAccount(id, accountId), IssuerSchema, {
    method: 'PUT',
    body,
  });

export const setDefaultIssuerBankAccount = (id: string, accountId: string) =>
  fetchAndValidate(`${bankAccount(id, accountId)}/default`, IssuerSchema, {
    method: 'POST',
  });

/** Checks the account's holder name with the bank; answers the account with its status. */
export const verifyIssuerBankAccount = (id: string, accountId: string) =>
  fetchAndValidate(
    `${bankAccount(id, accountId)}/verify`,
    IssuerBankAccountSchema,
    { method: 'POST' },
  );

export const deleteIssuerBankAccount = (id: string, accountId: string) =>
  fetchAndValidate(bankAccount(id, accountId), IssuerSchema, {
    method: 'DELETE',
  });
