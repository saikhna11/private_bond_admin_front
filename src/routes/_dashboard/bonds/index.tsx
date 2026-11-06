import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import { BondListTable } from '@/components/bond/bond-list-table';
import {
  DayRangeFilter,
  FilterBar,
  FilterSelect,
  Pagination,
  SearchInput,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PAGE_SIZE } from '@/lib/types';
import { bondsOptions } from '@/queries/bond/options';
import { SalesStatusSchema, salesStatusLabel } from '@/queries/bond/type';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  issuer: z.string().optional().catch(undefined),
  status: SalesStatusSchema.optional().catch(undefined),
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

export const Route = createFileRoute('/_dashboard/bonds/')({
  validateSearch: searchSchema,
  component: BondsPage,
});

function BondsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isPending, error, isPlaceholderData } = useQuery(
    bondsOptions(search),
  );
  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );
  const setIssuer = useCallback(
    (issuer: string) => setFilter({ issuer: issuer || undefined }),
    [setFilter],
  );
  const setQuery = useCallback(
    (q: string) =>
      navigate({
        search: (prev) => ({ ...prev, q: q || undefined, page: undefined }),
      }),
    [navigate],
  );

  return (
    <>
      <PageTitle
        title="Бонд"
        description="Бонд, түүний хүүгийн нөхцөл, танилцуулга, нүүр зургийг бүртгэнэ."
        action={
          <Button asChild>
            <Link to="/bonds/new">
              <PlusIcon />
              Бонд нэмэх
            </Link>
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        <FilterBar
          search={
            <SearchInput
              value={search.q ?? ''}
              onChange={setQuery}
              placeholder="Код эсвэл нэрээр хайх"
            />
          }
        >
          <SearchInput
            value={search.issuer ?? ''}
            onChange={setIssuer}
            placeholder="Бонд гаргагчийн нэрээр хайх"
          />
          <FilterSelect
            value={search.status}
            onChange={(status) => setFilter({ status })}
            allLabel="Бүх төлөв"
            options={SalesStatusSchema.options.map((s) => ({
              value: s,
              label: salesStatusLabel[s],
            }))}
          />
          <DayRangeFilter
            id="bonds-days"
            from={search.from}
            to={search.to}
            onChange={(range) => setFilter(range)}
          />
        </FilterBar>
        <BondListTable
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
