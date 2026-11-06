import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import { FilterSelect } from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVariableActions } from '@/components/variable/use-variable-actions';
import { VariableFormDialog } from '@/components/variable/variable-form-dialog';
import { VariableListPanel } from '@/components/variable/variable-list-panel';
import { WordCategoryTabs } from '@/components/variable/word-category-tabs';
import { WordFormDialog } from '@/components/variable/word-form-dialog';
import { WordListTable } from '@/components/variable/word-list-table';
import { showToast } from '@/lib/utils';
import { VariableViewSchema, viewKinds } from '@/queries/variable/type';
import { wordKeys } from '@/queries/word/options';
import { createWord } from '@/queries/word/query';
import {
  addableWordCategories,
  WordCategorySchema,
  wordCodeField,
} from '@/queries/word/type';

// From md up the page fits the screen and only the table scrolls, under its header, with the
// pages below it.
const fitScreen =
  'flex flex-col gap-6 md:h-[calc(100svh-var(--header-height)-4rem)] lg:h-[calc(100svh-var(--header-height)-5rem)]';
const scrollArea =
  'md:min-h-0 md:flex-1 max-md:[&_[data-slot=table-container]]:max-h-[70svh] [&_[data-slot=table-container]]:min-h-0 [&_[data-slot=table-container]]:flex-1 [&_[data-slot=table-container]]:overflow-auto';

const searchSchema = z.object({
  tab: z.enum(['variables', 'dictionary']).optional().catch(undefined),
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
  const queryClient = useQueryClient();
  const actions = useVariableActions();
  const dictionary = search.tab === 'dictionary';
  const category = search.category ?? 'bank';
  const view = search.view ?? 'all';
  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );
  const onPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) });
  const addWord = wordCodeField[category];

  return (
    <div className={fitScreen}>
      <PageTitle
        title="Хувьсагч"
        description="Загварын хоосон зайд холбогдох хувьсагчид болон гэрээнд хэвлэгдэх кодын орчуулга (толь бичиг). Өөрчлөлт зөвхөн шинэ гэрээнд нөлөөлнө."
        action={
          !dictionary ? (
            <VariableFormDialog
              create={view === 'custom' ? 'custom' : 'field'}
              onSubmit={actions.create}
              trigger={
                <Button>
                  <PlusIcon />
                  Хувьсагч нэмэх
                </Button>
              }
            />
          ) : (
            addWord &&
            addableWordCategories.includes(category) && (
              <WordFormDialog
                category={category}
                title={addWord.add}
                onSubmit={async (body) => {
                  await createWord({ category, ...body });
                  await queryClient.invalidateQueries({
                    queryKey: wordKeys.all,
                  });
                  showToast('success', 'Үг нэмэгдлээ');
                }}
                trigger={
                  <Button>
                    <PlusIcon />
                    {addWord.add}
                  </Button>
                }
              />
            )
          )
        }
      />
      <Tabs
        className="shrink-0"
        value={dictionary ? 'dictionary' : 'variables'}
        onValueChange={(v) =>
          navigate({
            search: { tab: v === 'dictionary' ? 'dictionary' : undefined },
          })
        }
      >
        <TabsList>
          <TabsTrigger value="variables">Хувьсагч</TabsTrigger>
          <TabsTrigger value="dictionary">Толь бичиг</TabsTrigger>
        </TabsList>
      </Tabs>

      {dictionary ? (
        <Card className={`gap-0 py-0 ${scrollArea}`}>
          <div className="shrink-0 border-b p-4">
            <WordCategoryTabs
              value={category}
              onChange={(c) =>
                navigate({ search: { tab: 'dictionary', category: c } })
              }
            />
          </div>
          <WordListTable category={category} />
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
            viewSelect={
              <FilterSelect
                value={search.view}
                onChange={(v) => setFilter({ view: v })}
                allLabel="Бүх хувьсагч"
                options={[
                  { value: 'system', label: 'Систем' },
                  { value: 'field', label: 'Талбар' },
                  { value: 'custom', label: 'Тогтмол текст' },
                  { value: 'unused', label: 'Ашиглаагүй' },
                ]}
              />
            }
            onFilter={setFilter}
            onPage={onPage}
          />
        </Card>
      )}
    </div>
  );
}
