import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import { showToast } from '@/lib/utils';
import { contractVariablesOptions } from '@/queries/template/options';
import {
  type TemplateDetailType,
  type TemplateStatus,
  variableFits,
} from '@/queries/template/type';
import { FieldMappingRow } from './field-mapping-row';
import { UnmappedFilterToggle } from './unmapped-filter-toggle';
import type { FieldMapping } from './use-field-mapping';

// The table scrolls inside the card, which then fits the screen below the app header.
const scrollArea =
  '[&_[data-slot=table-container]]:max-h-[max(16rem,calc(100svh-var(--header-height)-10rem))] [&_[data-slot=table-container]]:overflow-y-auto';

const readOnlyHint: Record<TemplateStatus, string> = {
  draft: '',
  active: ' · засахын тулд эхлээд идэвхгүй болгоно',
  inactive: ' · засахын тулд «Засах» дарна',
};

/** The template's placeholders and what fills each, with the save of a draft's changes. */
export function FieldMappingTable({
  t,
  mapping,
  focused,
}: {
  t: TemplateDetailType;
  mapping: FieldMapping;
  /** The placeholder whose row the problems list points at. */
  focused: string | null;
}) {
  const { data: catalog = [] } = useQuery(contractVariablesOptions());
  const variables = catalog.filter((v) => variableFits(v, t.ownership_type));
  const readOnly = t.status !== 'draft';
  const total = t.fields.length;
  const mapped = total - mapping.unmapped.length;
  const [saving, setSaving] = useState(false);
  // The placeholders unmapped when the filter was turned on: a row stays while it is
  // mapped, and one unmapped again joins them.
  const [only, setOnly] = useState<Set<string> | null>(null);
  const rows = only
    ? t.fields.filter(
        (f) =>
          only.has(f.placeholder) || mapping.unmapped.includes(f.placeholder),
      )
    : t.fields;

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
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="min-w-48 flex-1">
          <CardTitle>Хоосон зай</CardTitle>
          <CardDescription className="tabular">
            {mapped} / {total} холбосон{readOnlyHint[t.status]}
          </CardDescription>
          {total > 0 && (
            <div className="mt-2 h-1.5 max-w-64 overflow-hidden rounded-full bg-muted">
              <div
                className={
                  mapped === total
                    ? 'h-full bg-success transition-all'
                    : 'h-full bg-warning transition-all'
                }
                style={{ width: `${(mapped / total) * 100}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!readOnly && (only || mapping.unmapped.length > 0) && (
            <UnmappedFilterToggle
              on={only !== null}
              count={mapping.unmapped.length}
              onToggle={() => setOnly(only ? null : new Set(mapping.unmapped))}
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
      <CardContent className={`p-0 ${scrollArea}`}>
        {total === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Энэ загварт {'{нэр}'} хэлбэрийн хоосон зай алга.
          </p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--color-border)]">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Хоосон зай</TableHead>
                <TableHead>Эх сурвалж</TableHead>
                <TableHead className="pr-4">Утга</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((f) => (
                <FieldMappingRow
                  key={f.placeholder}
                  value={mapping.mappingOf(f)}
                  variables={variables}
                  changed={f.placeholder in mapping.changes}
                  focused={f.placeholder === focused}
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
