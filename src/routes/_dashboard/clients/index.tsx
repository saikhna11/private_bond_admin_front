import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CircleAlertIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import {
  FilterSelect,
  Pagination,
  SearchInput,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { ActiveBadge, StatusBadge } from '@/components/common/status-badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toApiError } from '@/lib/fetcher';
import { formatDate } from '@/lib/format';
import { PAGE_SIZE } from '@/lib/types';
import { clientsOptions } from '@/queries/client/options';
import {
  ClientTypeSchema,
  clientTypeLabel,
  ReviewStatusSchema,
} from '@/queries/client/type';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  type: ClientTypeSchema.optional().catch(undefined),
  status: ReviewStatusSchema.optional().catch(undefined),
  active: z.enum(['active', 'inactive']).optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/clients/')({
  validateSearch: searchSchema,
  component: ClientsPage,
});

const COLS = 7;

function ClientsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const page = search.page ?? 1;
  const { data, isPending, error, isPlaceholderData } = useQuery(
    clientsOptions(search),
  );

  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );
  const setQ = useCallback(
    (q: string) => setFilter({ q: q || undefined }),
    [setFilter],
  );

  return (
    <>
      <PageTitle
        title="Харилцагчид"
        description="Бүртгүүлсэн харилцагчдыг шалгах, баталгаажуулах, хаах."
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4">
          <Tabs
            value={search.status ?? 'all'}
            onValueChange={(v) =>
              setFilter({
                status:
                  v === 'all'
                    ? undefined
                    : (v as z.infer<typeof ReviewStatusSchema>),
              })
            }
          >
            <TabsList className="w-full sm:w-fit">
              <TabsTrigger value="all">Бүгд</TabsTrigger>
              <TabsTrigger value="pending">Хүлээгдэж буй</TabsTrigger>
              <TabsTrigger value="approved">Баталгаажсан</TabsTrigger>
              <TabsTrigger value="rejected">Цуцлагдсан</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <SearchInput
              value={search.q ?? ''}
              onChange={setQ}
              placeholder="Нэр, имэйл, утас, РД"
            />
            <FilterSelect
              value={search.type}
              onChange={(type) => setFilter({ type })}
              allLabel="Бүх төрөл"
              options={ClientTypeSchema.options.map((t) => ({
                value: t,
                label: clientTypeLabel[t],
              }))}
            />
            <FilterSelect
              value={search.active}
              onChange={(active) => setFilter({ active })}
              allLabel="Идэвхтэй, хаагдсан"
              options={[
                { value: 'active', label: 'Идэвхтэй' },
                { value: 'inactive', label: 'Хаагдсан' },
              ]}
            />
          </div>
        </div>

        <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Харилцагч</TableHead>
              <TableHead>Төрөл</TableHead>
              <TableHead>РД</TableHead>
              <TableHead>Утас</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead className="pr-4 text-right">Бүртгүүлсэн</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeletonRows cols={COLS} />
            ) : error ? (
              <TableEmpty
                cols={COLS}
                title="Ачаалж чадсангүй"
                text={toApiError(error).message}
              />
            ) : !data?.items.length ? (
              <TableEmpty
                cols={COLS}
                title="Харилцагч олдсонгүй"
                text="Хайлт, шүүлтүүрээ өөрчилж үзнэ үү."
              />
            ) : (
              data.items.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: '/clients/$clientId',
                      params: { clientId: c.id },
                    })
                  }
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                        {c.display_name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-medium">
                          {c.display_name}
                        </p>
                        <p className="max-w-56 truncate text-xs text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {clientTypeLabel[c.type]}
                  </TableCell>
                  <TableCell className="tabular font-mono text-xs">
                    {c.register_number}
                  </TableCell>
                  <TableCell className="tabular">{c.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={c.status} />
                      {!c.profile_complete && c.type !== 'org_member' && (
                        <CircleAlertIcon
                          className="size-4 text-muted-foreground"
                          aria-label="Мэдээлэл дутуу"
                        >
                          <title>Мэдээлэл дутуу</title>
                        </CircleAlertIcon>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ActiveBadge active={c.is_active} />
                  </TableCell>
                  <TableCell className="tabular pr-4 text-right text-muted-foreground">
                    {formatDate(c.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {data && data.total > 0 && (
          <Pagination
            page={page}
            size={PAGE_SIZE}
            total={data.total}
            onPage={(p) =>
              navigate({ search: (prev) => ({ ...prev, page: p }) })
            }
          />
        )}
      </Card>
    </>
  );
}
