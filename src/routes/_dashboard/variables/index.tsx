import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import {
  FilterSelect,
  Pagination,
  SearchInput,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVariableActions } from '@/components/variable/use-variable-actions';
import { VariableFormDialog } from '@/components/variable/variable-form-dialog';
import { VariableListTable } from '@/components/variable/variable-list-table';
import { WordListTable } from '@/components/variable/word-list-table';
import { PAGE_SIZE } from '@/lib/types';
import {
  variableGroupsOptions,
  variablesOptions,
} from '@/queries/variable/options';
import {
  type VariableFilters,
  VariableViewSchema,
} from '@/queries/variable/type';
import { WordCategorySchema, wordCategoryLabel } from '@/queries/word/type';

const searchSchema = z.object({
  tab: z.enum(['variables', 'words']).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  view: VariableViewSchema.optional().catch(undefined),
  group: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  category: WordCategorySchema.optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/variables/')({
  validateSearch: searchSchema,
  component: VariablesPage,
  staticData: { crumb: 'Хувьсагч' },
});

function VariablesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const actions = useVariableActions();
  const words = search.tab === 'words';
  const filters: VariableFilters = {
    page: search.page,
    view: search.view,
    group: search.group,
    q: search.q,
  };
  const { data, isPending, error, isPlaceholderData } = useQuery({
    ...variablesOptions(filters),
    enabled: !words,
  });
  const { data: groups } = useQuery(variableGroupsOptions());
  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );

  return (
    <>
      <PageTitle
        title="Хувьсагч"
        description="Загварын хоосон зайд холбогдох утгууд болон гэрээнд хэвлэгдэх үгс. Өөрчлөлт зөвхөн шинэ гэрээнд нөлөөлнө."
        action={
          !words && (
            <VariableFormDialog
              onSubmit={actions.create}
              trigger={
                <Button>
                  <PlusIcon />
                  Хувьсагч нэмэх
                </Button>
              }
            />
          )
        }
      />
      <Tabs
        value={words ? 'words' : 'variables'}
        onValueChange={(v) =>
          navigate({ search: { tab: v === 'words' ? 'words' : undefined } })
        }
      >
        <TabsList>
          <TabsTrigger value="variables">Хувьсагч</TabsTrigger>
          <TabsTrigger value="words">Үгс</TabsTrigger>
        </TabsList>
      </Tabs>

      {words ? (
        <Card className="gap-0 py-0">
          <div className="border-b p-4">
            <Tabs
              value={search.category ?? 'bank'}
              onValueChange={(v) =>
                setFilter({ category: WordCategorySchema.parse(v) })
              }
            >
              <TabsList className="w-full sm:w-fit">
                {WordCategorySchema.options.map((c) => (
                  <TabsTrigger key={c} value={c}>
                    {wordCategoryLabel[c]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <WordListTable category={search.category ?? 'bank'} />
        </Card>
      ) : (
        <Card className="gap-0 py-0">
          <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
            <Tabs
              value={search.view ?? 'all'}
              onValueChange={(v) =>
                setFilter({
                  view: v === 'all' ? undefined : VariableViewSchema.parse(v),
                })
              }
            >
              <TabsList className="w-full sm:w-fit">
                <TabsTrigger value="all">Бүгд</TabsTrigger>
                <TabsTrigger value="system">Систем</TabsTrigger>
                <TabsTrigger value="custom">Нэмэлт</TabsTrigger>
                <TabsTrigger value="unused">Ашиглаагүй</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchInput
                value={search.q ?? ''}
                onChange={(q) => setFilter({ q: q || undefined })}
                placeholder="Нэр, утгаар хайх"
              />
              <FilterSelect
                value={search.group}
                onChange={(group) => setFilter({ group })}
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
              page={search.page ?? 1}
              size={PAGE_SIZE}
              total={data.total}
              onPage={(page) =>
                navigate({ search: (prev) => ({ ...prev, page }) })
              }
            />
          )}
        </Card>
      )}
    </>
  );
}
