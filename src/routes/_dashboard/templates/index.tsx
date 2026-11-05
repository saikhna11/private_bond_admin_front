import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { UploadIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import { Pagination } from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { BondCombobox } from '@/components/template/bond-combobox';
import { TemplateListTable } from '@/components/template/template-list-table';
import { UploadTemplateDialog } from '@/components/template/upload-template-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PAGE_SIZE } from '@/lib/types';
import { showToast } from '@/lib/utils';
import { templateKeys, templatesOptions } from '@/queries/template/options';
import {
  type TemplateFilters,
  TemplateStatusSchema,
} from '@/queries/template/type';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  status: TemplateStatusSchema.optional().catch(undefined),
  bond_id: z.guid().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/templates/')({
  validateSearch: searchSchema,
  component: TemplatesPage,
});

function TemplatesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const { data, isPending, error, isPlaceholderData } = useQuery(
    templatesOptions(search),
  );
  const setFilter = useCallback(
    (patch: Partial<TemplateFilters>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );

  return (
    <>
      <PageTitle
        title="Гэрээний загвар"
        description="Word загвар оруулж, хоосон зай бүрийг гэрээний мэдээлэл эсвэл тогтмол тексттэй холбоно."
        action={
          <UploadTemplateDialog
            trigger={
              <Button>
                <UploadIcon />
                Загвар оруулах
              </Button>
            }
            onUploaded={(t) => {
              showToast('success', 'Загвар ноорог болж хадгалагдлаа');
              void queryClient.invalidateQueries({
                queryKey: templateKeys.all,
              });
              void navigate({
                to: '/templates/$templateId',
                params: { templateId: t.id },
              });
            }}
          />
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={search.status ?? 'all'}
            onValueChange={(v) =>
              setFilter({
                status: v === 'all' ? undefined : TemplateStatusSchema.parse(v),
              })
            }
          >
            <TabsList className="w-full sm:w-fit">
              <TabsTrigger value="all">Бүгд</TabsTrigger>
              <TabsTrigger value="draft">Ноорог</TabsTrigger>
              <TabsTrigger value="active">Идэвхтэй</TabsTrigger>
              <TabsTrigger value="inactive">Идэвхгүй</TabsTrigger>
            </TabsList>
          </Tabs>
          <BondCombobox
            value={search.bond_id ?? ''}
            onChange={(id) => setFilter({ bond_id: id || undefined })}
            allLabel="Бүх бонд"
            className="sm:w-56"
          />
        </div>
        <TemplateListTable
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
