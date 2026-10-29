import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import { cn, showToast } from '@/lib/utils';
import { contractVariablesOptions } from '@/queries/template/options';
import {
  type TemplateDetailType,
  type TemplateStatus,
  templateEditable,
  variableFits,
} from '@/queries/template/type';
import { FieldMappingRow } from './field-mapping-row';
import { UnmappedFilterToggle } from './unmapped-filter-toggle';
import type { FieldMapping } from './use-field-mapping';
import { useUnmappedFilter } from './use-unmapped-filter';

// The table scrolls inside the card, which fills what the page leaves from md up.
const scrollArea =
  'max-md:[&_[data-slot=table-container]]:max-h-[70svh] [&_[data-slot=table-container]]:min-h-0 [&_[data-slot=table-container]]:flex-1 [&_[data-slot=table-container]]:overflow-auto';

const readOnlyHint: Record<TemplateStatus, string> = {
  draft: '',
  active: 'Засахын тулд эхлээд идэвхгүй болгоно',
  inactive: 'Засахын тулд «Засах» дарна',
};

/** The template's placeholders and what fills each, with the save of a draft's changes. */
export function FieldMappingTable({
  t,
  mapping,
}: {
  t: TemplateDetailType;
  mapping: FieldMapping;
}) {
  const { data: catalog = [] } = useQuery(contractVariablesOptions());
  const variables = catalog.filter((v) => variableFits(v, t.ownership_type));
  const readOnly = !templateEditable(t);
  // A template contracts were drafted from never changes; the Гэрээ page counts them.
  const hint = t.contracts > 0 ? '' : readOnlyHint[t.status];
  const total = t.fields.length;
  const mapped = total - mapping.unmapped.length;
  const [saving, setSaving] = useState(false);
  const filter = useUnmappedFilter(mapping);

  async function save() {
    setSaving(true);
    try {
      await mapping.save();
      showToast('success', 'Холболт хадгалагдлаа');
    } catch (err) {
      showToast('error', toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="gap-0 py-0 md:min-h-72 md:flex-1">
      <CardHeader className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3">
        <CardTitle>Хоосон зай</CardTitle>
        <span className="text-sm text-muted-foreground tabular">
          {mapped} / {total} холбосон
        </span>
        {total > 0 && (
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full transition-all',
                mapped === total ? 'bg-success' : 'bg-warning',
              )}
              style={{ width: `${(mapped / total) * 100}%` }}
            />
          </div>
        )}
        {readOnly && hint && (
          <span className="text-sm text-muted-foreground">{hint}</span>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {!readOnly && (filter.on || mapping.unmapped.length > 0) && (
            <UnmappedFilterToggle
              on={filter.on}
              count={mapping.unmapped.length}
              onToggle={filter.on ? filter.showAll : filter.showUnmapped}
            />
          )}
          {!readOnly && mapping.dirty && (
            <>
              <Button variant="outline" size="sm" onClick={mapping.discard}>
                Болих
              </Button>
              <Button
                size="sm"
                onClick={() => void save()}
                disabled={saving || mapping.incomplete}
              >
                {saving && <Loader2Icon className="animate-spin" />}
                Хадгалах
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className={`flex min-h-0 flex-1 flex-col p-0 ${scrollArea}`}>
        {total === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Энэ загварт {'{нэр}'} хэлбэрийн хоосон зай алга.
          </p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--color-border)]">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-80 pl-4">Хоосон зай</TableHead>
                <TableHead className="w-48">Эх сурвалж</TableHead>
                <TableHead className="pr-4">Утга</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filter.rowsOf(t.fields).map((f) => (
                <FieldMappingRow
                  key={f.placeholder}
                  value={mapping.mappingOf(f)}
                  variables={variables}
                  changed={f.placeholder in mapping.changes}
                  readOnly={readOnly}
                  onChange={(patch) => mapping.change(f, patch)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
