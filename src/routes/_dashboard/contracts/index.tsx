import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import * as z from 'zod';
import {
  FilterSelect,
  Pagination,
  SearchInput,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { ContractListTable } from '@/components/contract/contract-list-table';
import { Card } from '@/components/ui/card';
import { PAGE_SIZE } from '@/lib/types';
import { contractsOptions } from '@/queries/contract/options';
import {
  type ContractFilters,
  ContractStatusSchema,
  contractStatusLabel,
} from '@/queries/contract/type';
import { templatesOptions } from '@/queries/template/options';
import { ownershipLabel } from '@/queries/template/type';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  status: ContractStatusSchema.optional().catch(undefined),
  template: z.guid().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/contracts/')({
  validateSearch: searchSchema,
  component: ContractsPage,
});

function ContractsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isPending, error, isPlaceholderData } = useQuery(
    contractsOptions(search),
  );
  // Every template a contract can come from fits one page of the list.
  const { data: templates } = useQuery(templatesOptions({}));
  const setFilter = useCallback(
    (patch: Partial<ContractFilters>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );

  return (
    <>
      <PageTitle
        title="Гэрээ"
        description="Харилцагчдын байгуулсан гэрээ, аль загвараас үүссэнийг харна."
      />
      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search.q ?? ''}
            onChange={(q) => setFilter({ q: q || undefined })}
            placeholder="Дугаараар хайх: MFG-26"
          />
          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row">
            <FilterSelect
              value={search.status}
              onChange={(status) => setFilter({ status })}
              allLabel="Бүх төлөв"
              options={ContractStatusSchema.options.map((s) => ({
                value: s,
                label: contractStatusLabel[s],
              }))}
            />
            <FilterSelect
              value={search.template}
              onChange={(template) => setFilter({ template })}
              allLabel="Бүх загвар"
              options={(templates?.items ?? []).map((t) => ({
                value: t.id,
                label: `${t.name} · ${ownershipLabel[t.ownership_type]}`,
              }))}
            />
          </div>
        </div>
        <ContractListTable
          items={data?.items}
          isPending={isPending}
          error={error}
          dimmed={isPlaceholderData}
        />
        {data && data.total > 0 && (
          <Pagination
            page={search.page ?? 1}
            size={PAGE_SIZE}
            total={data.total}
            onPage={(page) =>
              navigate({ search: (prev) => ({ ...prev, page }) })
            }
          />
        )}
      </Card>
    </>
  );
}
