import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import { AdminContractSchema, type ContractFilters } from './type';

export const getContracts = (f: ContractFilters) =>
  fetchAndValidate(
    `contracts${listQuery({ page: f.page, size: PAGE_SIZE, status: f.status, template: f.template, q: f.q })}`,
    pageSchema(AdminContractSchema),
  );
