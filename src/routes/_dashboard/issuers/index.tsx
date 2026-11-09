import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Building2Icon, PlusIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import {
  Pagination,
  SearchInput,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { CreateIssuerDialog } from '@/components/issuer/issuer-form-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCan } from '@/hooks/use-can';
import { toApiError } from '@/lib/fetcher';
import { formatDate } from '@/lib/format';
import { PRIV } from '@/lib/rbac';
import { PAGE_SIZE } from '@/lib/types';
import { showToast } from '@/lib/utils';
import { issuerKeys, issuersOptions } from '@/queries/issuer/options';
import { createIssuer } from '@/queries/issuer/query';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/issuers/')({
  validateSearch: searchSchema,
  component: IssuersPage,
});

const COLS = 3;

function IssuersPage() {
  const can = useCan();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const page = search.page ?? 1;
  const { data, isPending, error, isPlaceholderData } = useQuery(
    issuersOptions(search),
  );
  const setQ = useCallback(
    (q: string) =>
      navigate({
        search: (prev) => ({ ...prev, q: q || undefined, page: undefined }),
      }),
    [navigate],
  );

  return (
    <>
      <PageTitle
        title="Бонд гаргагчид"
        description="Бондоор хөрөнгө босгох компаниуд, тэдний ажилтан, банкны данс."
        action={
          can(PRIV.issuerCreate) && (
            <CreateIssuerDialog
              trigger={
                <Button>
                  <PlusIcon />
                  Бонд гаргагч бүртгэх
                </Button>
              }
              onSubmit={async (body) => {
                const issuer = await createIssuer(body);
                showToast('success', 'Бонд гаргагч бүртгэгдлээ');
                await queryClient.invalidateQueries({
                  queryKey: issuerKeys.all,
                });
                await navigate({
                  to: '/issuers/$issuerId',
                  params: { issuerId: issuer.id },
                });
              }}
            />
          )
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row">
          <SearchInput
            value={search.q ?? ''}
            onChange={setQ}
            placeholder="Нэр эсвэл регистрийн дугаар"
          />
        </div>
        <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Компани</TableHead>
              <TableHead>Регистрийн дугаар</TableHead>
              <TableHead className="pr-4 text-right">Бүртгэсэн</TableHead>
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
                title={search.q ? 'Олдсонгүй' : 'Бонд гаргагч алга'}
                text={
                  search.q
                    ? 'Хайлтаа өөрчилж үзнэ үү.'
                    : '"Бонд гаргагч бүртгэх" товчоор эхнийхээ компанийг нэмнэ үү.'
                }
              />
            ) : (
              data.items.map((i) => (
                <TableRow
                  key={i.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: '/issuers/$issuerId',
                      params: { issuerId: i.id },
                    })
                  }
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2Icon className="size-4" />
                      </span>
                      <p className="max-w-96 truncate font-medium">{i.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="tabular font-mono text-xs">
                    {i.register_number}
                  </TableCell>
                  <TableCell className="tabular pr-4 text-right text-muted-foreground">
                    {formatDate(i.created_at)}
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
