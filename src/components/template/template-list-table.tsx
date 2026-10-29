import { useNavigate } from '@tanstack/react-router';
import { TableEmpty, TableSkeletonRows } from '@/components/common/list-parts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import { formatDate } from '@/lib/format';
import {
  languageLabel,
  ownershipLabel,
  type TemplateSummaryType,
} from '@/queries/template/type';
import { TemplateStatusBadge } from './template-status-badge';
import { TtdBadge } from './ttd-badge';

const COLS = 6;

/** The templates of one page; a row opens the template. */
export function TemplateListTable({
  items,
  isPending,
  error,
  dimmed,
}: {
  items?: TemplateSummaryType[];
  isPending: boolean;
  error: unknown;
  dimmed: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Table className={dimmed ? 'opacity-60' : undefined}>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Загвар</TableHead>
          <TableHead>Бүтээгдэхүүн</TableHead>
          <TableHead>Хэл</TableHead>
          <TableHead>Холбосон</TableHead>
          <TableHead>Төлөв</TableHead>
          <TableHead className="pr-4 text-right">Оруулсан</TableHead>
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
        ) : !items?.length ? (
          <TableEmpty
            cols={COLS}
            title="Загвар олдсонгүй"
            text="Word загвараа оруулаад хоосон зай бүрийг хувьсагчтай холбоно."
          />
        ) : (
          items.map((t) => (
            <TableRow
              key={t.id}
              className="cursor-pointer"
              onClick={() =>
                navigate({
                  to: '/templates/$templateId',
                  params: { templateId: t.id },
                })
              }
            >
              <TableCell className="pl-4">
                <p className="max-w-64 truncate font-medium">{t.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {ownershipLabel[t.ownership_type]}
                  {t.ttd && <TtdBadge />}
                </p>
              </TableCell>
              <TableCell className="font-mono text-xs">{t.product}</TableCell>
              <TableCell className="text-muted-foreground">
                {languageLabel[t.language]}
              </TableCell>
              <TableCell className="tabular">
                {t.mapped} / {t.fields}
              </TableCell>
              <TableCell>
                <TemplateStatusBadge status={t.status} />
              </TableCell>
              <TableCell className="tabular pr-4 text-right text-muted-foreground">
                {formatDate(t.created_at)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
