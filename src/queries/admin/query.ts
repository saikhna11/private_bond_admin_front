import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  type AdminFilters,
  AdminSchema,
  type CreateAdminBody,
  type UpdateAdminBody,
} from './type';

export const getAdmins = (f: AdminFilters) =>
  fetchAndValidate(
    `admins${listQuery({
      page: f.page,
      size: PAGE_SIZE,
      q: f.q,
      status: f.status,
      role_id: f.role_id,
    })}`,
    pageSchema(AdminSchema),
  );

export const createAdmin = (body: CreateAdminBody) =>
  fetchAndValidate('admins', AdminSchema, { method: 'POST', body });

export const updateAdmin = (id: string, body: UpdateAdminBody) =>
  fetchAndValidate(`admins/${id}`, AdminSchema, { method: 'PATCH', body });

export const assignAdminRole = (id: string, roleId: string) =>
  fetchAndValidate(`admins/${id}/role`, AdminSchema, {
    method: 'PUT',
    body: { role_id: roleId },
  });

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
