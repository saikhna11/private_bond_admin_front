import * as z from 'zod';
import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  AdminVariableSchema,
  type VariableBody,
  VariableFieldCatalogSchema,
  type VariableFilters,
} from './type';

export const getVariables = (f: VariableFilters) => {
  const view = f.view ?? 'all';
  return fetchAndValidate(
    `variables${listQuery({
      page: f.page,
      size: PAGE_SIZE,
      kind: view === 'all' || view === 'unused' ? undefined : view,
      unused: view === 'unused' ? 'true' : undefined,
      group: f.group,
      q: f.q,
    })}`,
    pageSchema(AdminVariableSchema),
  );
};

export const getVariableGroups = () =>
  fetchAndValidate('variable-groups', z.array(z.string()));

export const getVariableFields = () =>
  fetchAndValidate('variable-fields', VariableFieldCatalogSchema);

export const createVariable = (body: VariableBody) =>
  fetchAndValidate('variables', AdminVariableSchema, { method: 'POST', body });

export const updateVariable = (id: string, body: VariableBody) =>
  fetchAndValidate(`variables/${id}`, AdminVariableSchema, {
    method: 'PUT',
    body,
  });

export const deleteVariable = (id: string) =>
  fetchAndValidate(`variables/${id}`, undefined, { method: 'DELETE' });
