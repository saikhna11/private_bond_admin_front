import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  BrokerSchema,
  type CreateBrokerBody,
  type StaffFilters,
  type UpdateBrokerBody,
} from './type';

export const getBrokers = (f: StaffFilters) =>
  fetchAndValidate(
    `brokers${listQuery({ page: f.page, size: PAGE_SIZE, q: f.q, status: f.status })}`,
    pageSchema(BrokerSchema),
  );

export const createBroker = (body: CreateBrokerBody) =>
  fetchAndValidate('brokers', BrokerSchema, { method: 'POST', body });

export const updateBroker = (id: string, body: UpdateBrokerBody) =>
  fetchAndValidate(`brokers/${id}`, BrokerSchema, { method: 'PATCH', body });

export const blockBroker = (id: string) =>
  fetchAndValidate(`brokers/${id}/block`, undefined, { method: 'POST' });

export const unblockBroker = (id: string) =>
  fetchAndValidate(`brokers/${id}/unblock`, undefined, { method: 'POST' });

export const resetBrokerPassword = (id: string, password: string) =>
  fetchAndValidate(`brokers/${id}/password`, undefined, {
    method: 'POST',
    body: { password },
  });

export const deleteBroker = (id: string) =>
  fetchAndValidate(`brokers/${id}`, undefined, { method: 'DELETE' });
