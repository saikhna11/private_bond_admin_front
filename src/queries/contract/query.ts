import fetchAndValidate, { adminApi, toApiError } from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  AdminContractDetailSchema,
  AdminContractSchema,
  type ContractFilters,
} from './type';

export const getContracts = (f: ContractFilters) =>
  fetchAndValidate(
    `contracts${listQuery({ page: f.page, size: PAGE_SIZE, status: f.status, template: f.template, q: f.q })}`,
    pageSchema(AdminContractSchema),
  );

export const getContract = (id: string) =>
  fetchAndValidate(`contracts/${id}`, AdminContractDetailSchema);

/** The contract's signed PDF. */
export async function downloadContractDocument(id: string): Promise<Blob> {
  try {
    const res = await adminApi.client.get<Blob>(`contracts/${id}/document`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}
