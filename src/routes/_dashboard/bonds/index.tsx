import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import { BondListTable } from '@/components/bond/bond-list-table';
import { Pagination, SearchInput } from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCan } from '@/hooks/use-can';
import { PRIV } from '@/lib/rbac';
import { PAGE_SIZE } from '@/lib/types';
import { bondsOptions } from '@/queries/bond/options';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/bonds/')({
  validateSearch: searchSchema,
  component: BondsPage,
});

function BondsPage() {
  const can = useCan();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isPending, error, isPlaceholderData } = useQuery(
    bondsOptions(search),
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
          can(PRIV.bondCreate) && (
            <Button asChild>
              <Link to="/bonds/new">
                <PlusIcon />
                Бонд нэмэх
              </Link>
            </Button>
          )
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search.q ?? ''}
            onChange={setQuery}
            placeholder="Код эсвэл нэрээр хайх"
          />
        </div>
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
