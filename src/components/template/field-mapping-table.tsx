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
import { type TemplateDetailType, variableFits } from '@/queries/template/type';
import { FieldMappingRow } from './field-mapping-row';
import type { FieldMapping } from './use-field-mapping';

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
  const readOnly = t.status !== 'draft';
  const mapped = t.fields.filter(
    (f) => mapping.mappingOf(f).source !== 'unmapped',
  ).length;
  const [saving, setSaving] = useState(false);

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
        <div>
          <CardTitle>Хоосон зай</CardTitle>
          <CardDescription className="tabular">
            {mapped} / {t.fields.length} холбосон
            {readOnly && ' · идэвхжүүлсэн загвар өөрчлөгдөхгүй'}
          </CardDescription>
        </div>
        {!readOnly && mapping.dirty && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={mapping.discard}>
              Болих
            </Button>
            <Button
              onClick={() => void save()}
              disabled={saving || mapping.incomplete}
            >
              {saving && <Loader2Icon className="animate-spin" />}
              Хадгалах
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {t.fields.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Энэ загварт {'{нэр}'} хэлбэрийн хоосон зай алга.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Хоосон зай</TableHead>
                <TableHead>Эх сурвалж</TableHead>
                <TableHead className="pr-4">Утга</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.fields.map((f) => (
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
