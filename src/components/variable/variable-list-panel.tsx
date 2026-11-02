import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  FilterSelect,
  Pagination,
  SearchInput,
} from '@/components/common/list-parts';
import { PAGE_SIZE } from '@/lib/types';
import {
  variableGroupsOptions,
  variablesOptions,
} from '@/queries/variable/options';
import type { VariableFilters } from '@/queries/variable/type';
import { useVariableActions } from './use-variable-actions';
import { VariableListTable } from './variable-list-table';

/**
 * One page of the variables filters picks, under a bar with tabs at its left and a search and
 * a group filter, of the groups of its kinds, at its right.
 */
export function VariableListPanel({
  filters,
  tabs,
  onFilter,
  onPage,
}: {
  filters: VariableFilters;
  tabs: ReactNode;
  onFilter: (patch: { q?: string; group?: string }) => void;
  onPage: (page: number) => void;
}) {
  const actions = useVariableActions();
  const { data, isPending, error, isPlaceholderData } = useQuery(
    variablesOptions(filters),
  );
  const { data: groups } = useQuery(variableGroupsOptions(filters.kinds));

  return (
    <>
      <div className="flex shrink-0 flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
        {tabs}
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            value={filters.q ?? ''}
            onChange={(q) => onFilter({ q: q || undefined })}
            placeholder="Нэр, утгаар хайх"
          />
          <FilterSelect
            value={filters.group}
            onChange={(group) => onFilter({ group })}
            allLabel="Бүх бүлэг"
            options={(groups ?? []).map((g) => ({ value: g, label: g }))}
          />
        </div>
      </div>
      <VariableListTable
        items={data?.items}
        isPending={isPending}
        error={error}
        dimmed={isPlaceholderData}
        onUpdate={actions.update}
        onDelete={actions.remove}
      />
      {data && data.total > 0 && (
        <Pagination
          page={filters.page ?? 1}
          size={PAGE_SIZE}
          total={data.total}
          onPage={onPage}
        />
      )}
    </>
  );
}
