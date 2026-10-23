import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import type { StaffFilters } from '@/queries/broker/type';
import {
  AdminSchema,
  type CreateAdminBody,
  type UpdateAdminBody,
} from './type';

export const getAdmins = (f: StaffFilters) =>
  fetchAndValidate(
    `admins${listQuery({ page: f.page, size: PAGE_SIZE, q: f.q, status: f.status })}`,
    pageSchema(AdminSchema),
  );

export const createAdmin = (body: CreateAdminBody) =>
  fetchAndValidate('admins', AdminSchema, { method: 'POST', body });

export const updateAdmin = (id: string, body: UpdateAdminBody) =>
  fetchAndValidate(`admins/${id}`, AdminSchema, { method: 'PATCH', body });

export const blockAdmin = (id: string) =>
  fetchAndValidate(`admins/${id}/block`, undefined, { method: 'POST' });

export const unblockAdmin = (id: string) =>
  fetchAndValidate(`admins/${id}/unblock`, undefined, { method: 'POST' });

export const resetAdminPassword = (id: string, password: string) =>
  fetchAndValidate(`admins/${id}/password`, undefined, {
    method: 'POST',
    body: { password },
  });

export const deleteAdmin = (id: string) =>
  fetchAndValidate(`admins/${id}`, undefined, { method: 'DELETE' });
