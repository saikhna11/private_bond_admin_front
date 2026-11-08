import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import * as z from "zod";
import {
  DayRangeFilter,
  FilterBar,
  FilterSelect,
  Pagination,
  SearchInput,
} from "@/components/common/list-parts";
import { PageTitle } from "@/components/common/page-title";
import { ContractListTable } from "@/components/contract/contract-list-table";
import { Card } from "@/components/ui/card";
import { PAGE_SIZE } from "@/lib/types";
import { contractsOptions } from "@/queries/contract/options";
import {
  type ContractFilters,
  ContractStatusSchema,
  contractStatusLabel,
} from "@/queries/contract/type";

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  status: ContractStatusSchema.optional().catch(undefined),
  template: z.guid().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/_dashboard/contracts/")({
  validateSearch: searchSchema,
  component: ContractsPage,
});

function ContractsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isPending, error, isPlaceholderData } = useQuery(
    contractsOptions(search),
  );

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
        <FilterBar
          search={
            <SearchInput
              value={search.q ?? ""}
              onChange={(q) => setFilter({ q: q || undefined })}
              placeholder="Дугаараар хайх: MFG-26"
            />
          }
        >
          <FilterSelect
            value={search.status}
            onChange={(status) => setFilter({ status })}
            allLabel="Бүх төлөв"
            options={ContractStatusSchema.options.map((s) => ({
              value: s,
              label: contractStatusLabel[s],
            }))}
          />
          <DayRangeFilter
            id="contracts-days"
            from={search.from}
            to={search.to}
            onChange={(range) => setFilter(range)}
          />
        </FilterBar>
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
