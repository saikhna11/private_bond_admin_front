import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaticValueTabs } from '@/components/variable/static-value-tabs';
import { useVariableActions } from '@/components/variable/use-variable-actions';
import { VariableFormDialog } from '@/components/variable/variable-form-dialog';
import { VariableListPanel } from '@/components/variable/variable-list-panel';
import { WordListTable } from '@/components/variable/word-list-table';
import {
  StaticCategorySchema,
  VariableViewSchema,
  viewKinds,
} from '@/queries/variable/type';

// From md up the page fits the screen and only the table scrolls, under its header, with the
// pages below it.
const fitScreen =
  'flex flex-col gap-6 md:h-[calc(100svh-var(--header-height)-4rem)] lg:h-[calc(100svh-var(--header-height)-5rem)]';
const scrollArea =
  'md:min-h-0 md:flex-1 max-md:[&_[data-slot=table-container]]:max-h-[70svh] [&_[data-slot=table-container]]:min-h-0 [&_[data-slot=table-container]]:flex-1 [&_[data-slot=table-container]]:overflow-auto';

const searchSchema = z.object({
  tab: z.enum(['variables', 'static']).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  view: VariableViewSchema.optional().catch(undefined),
  group: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  category: StaticCategorySchema.optional().catch(undefined),
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
  const fixed = search.tab === 'static';
  const category = search.category ?? 'text';
  const view = search.view ?? 'all';
  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );
  const onPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) });

  return (
    <div className={fitScreen}>
      <PageTitle
        title="Хувьсагч"
        description="Загварын хоосон зайд холбогдох утгууд: хувьсагч гэрээ бүрийн мэдээллээс уншигдана, тогтмол утга бүх гэрээнд ижил. Өөрчлөлт зөвхөн шинэ гэрээнд нөлөөлнө."
        action={
          !fixed ? (
            <VariableFormDialog
              create="field"
              onSubmit={actions.create}
              trigger={
                <Button>
                  <PlusIcon />
                  Хувьсагч нэмэх
                </Button>
              }
            />
          ) : (
            category === 'text' && (
              <VariableFormDialog
                create="custom"
                onSubmit={actions.create}
                trigger={
                  <Button>
                    <PlusIcon />
                    Тогтмол текст нэмэх
                  </Button>
                }
              />
            )
          )
        }
      />
      <Tabs
        className="shrink-0"
        value={fixed ? 'static' : 'variables'}
        onValueChange={(v) =>
          navigate({ search: { tab: v === 'static' ? 'static' : undefined } })
        }
      >
        <TabsList>
          <TabsTrigger value="variables">Хувьсагч</TabsTrigger>
          <TabsTrigger value="static">Тогтмол утга</TabsTrigger>
        </TabsList>
      </Tabs>

      {fixed ? (
        <Card className={`gap-0 py-0 ${scrollArea}`}>
          {category === 'text' ? (
            <VariableListPanel
              filters={{
                kinds: ['custom'],
                page: search.page,
                group: search.group,
                q: search.q,
              }}
              tabs={
                <StaticValueTabs
                  value={category}
                  onChange={(c) =>
                    navigate({ search: { tab: 'static', category: c } })
                  }
                />
              }
              onFilter={setFilter}
              onPage={onPage}
            />
          ) : (
            <>
              <div className="shrink-0 border-b p-4">
                <StaticValueTabs
                  value={category}
                  onChange={(c) =>
                    navigate({ search: { tab: 'static', category: c } })
                  }
                />
              </div>
              <WordListTable category={category} />
            </>
          )}
        </Card>
      ) : (
        <Card className={`gap-0 py-0 ${scrollArea}`}>
          <VariableListPanel
            filters={{
              kinds: viewKinds(view),
              unused: view === 'unused',
              page: search.page,
              group: search.group,
              q: search.q,
            }}
            tabs={
              <Tabs
                value={view}
                onValueChange={(v) =>
                  setFilter({
                    view: v === 'all' ? undefined : VariableViewSchema.parse(v),
                  })
                }
              >
                <TabsList className="w-full sm:w-fit">
                  <TabsTrigger value="all">Бүгд</TabsTrigger>
                  <TabsTrigger value="system">Систем</TabsTrigger>
                  <TabsTrigger value="field">Талбар</TabsTrigger>
                  <TabsTrigger value="unused">Ашиглаагүй</TabsTrigger>
                </TabsList>
              </Tabs>
            }
            onFilter={setFilter}
            onPage={onPage}
          />
        </Card>
      )}
    </div>
  );
}
