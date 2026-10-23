import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  type ClientFilters,
  ClientSchema,
  ClientSummarySchema,
  MemberSchema,
} from './type';

const ClientPageSchema = pageSchema(ClientSummarySchema);
const MemberPageSchema = pageSchema(MemberSchema);

export const getClients = (f: ClientFilters, size = PAGE_SIZE) =>
  fetchAndValidate(
    `clients${listQuery({ page: f.page, size, q: f.q, type: f.type, status: f.status, active: f.active })}`,
    ClientPageSchema,
  );

export const getClient = (id: string) =>
  fetchAndValidate(`clients/${id}`, ClientSchema);

export const getMembers = (orgId: string, page = 1) =>
  fetchAndValidate(
    `organizations/${orgId}/members${listQuery({ page, size: PAGE_SIZE })}`,
    MemberPageSchema,
  );

export const approveClient = (id: string) =>
  fetchAndValidate(`clients/${id}/approve`, undefined, { method: 'POST' });

export const rejectClient = (id: string, reason: string) =>
  fetchAndValidate(`clients/${id}/reject`, undefined, {
    method: 'POST',
    body: { reason },
  });

export const blockClient = (id: string) =>
  fetchAndValidate(`clients/${id}/block`, undefined, { method: 'POST' });

export const unblockClient = (id: string) =>
  fetchAndValidate(`clients/${id}/unblock`, undefined, { method: 'POST' });

export const deleteClient = (id: string) =>
  fetchAndValidate(`clients/${id}`, undefined, { method: 'DELETE' });

export const approveTaxExempt = (id: string) =>
  fetchAndValidate(`clients/${id}/tax-exemption/approve`, undefined, {
    method: 'POST',
  });

export const rejectTaxExempt = (id: string) =>
  fetchAndValidate(`clients/${id}/tax-exemption/reject`, undefined, {
    method: 'POST',
  });
