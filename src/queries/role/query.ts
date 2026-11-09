import * as z from 'zod';
import fetchAndValidate from '@/lib/fetcher';
import { PrivilegeSchema, RoleSchema } from './type';

export const getPrivileges = () =>
  fetchAndValidate('privileges', z.array(PrivilegeSchema));

export const getRoles = () => fetchAndValidate('roles', z.array(RoleSchema));

export const createRole = (name: string) =>
  fetchAndValidate('roles', RoleSchema, { method: 'POST', body: { name } });

export const updateRole = (
  id: string,
  body: { name: string; is_active: boolean },
) => fetchAndValidate(`roles/${id}`, RoleSchema, { method: 'PUT', body });

export const deleteRole = (id: string) =>
  fetchAndValidate(`roles/${id}`, undefined, { method: 'DELETE' });

/** The ids of the privileges a role is granted. */
export const getRolePrivileges = (id: string) =>
  fetchAndValidate(`roles/${id}/privileges`, z.array(z.string()));

/** Replaces what a role is granted with ids. */
export const setRolePrivileges = (id: string, ids: string[]) =>
  fetchAndValidate(`roles/${id}/privileges`, z.array(z.string()), {
    method: 'PUT',
    body: { privilege_ids: ids },
  });
