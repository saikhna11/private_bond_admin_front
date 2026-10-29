import { TriangleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AdminContractDetailType } from '@/queries/contract/type';

/** What a contract whose PDF is being made, or could not be, waits on. */
export function ContractStatusNote({ c }: { c: AdminContractDetailType }) {
  if (c.status === 'failed') {
    return (
      <Alert className="border-destructive/30 bg-destructive/5">
        <TriangleAlertIcon className="text-destructive" />
        <AlertTitle className="mb-1">
          Гарын үсэгтэй PDF-ийг гаргаж чадсангүй
        </AlertTitle>
        <AlertDescription>
          {c.render_attempts} удаа оролдсон.
          {c.render_error && (
            <span className="mt-1 block font-mono text-xs break-words">
              {c.render_error}
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  if (c.status === 'rendering') {
    return (
      <p className="text-sm text-muted-foreground">
        {c.render_attempts > 0
          ? `Бүх тал гарын үсэг зурсан. PDF ${c.render_attempts} удаа бүтэлгүйтсэн тул дахин оролдож байна.`
          : 'Бүх тал гарын үсэг зурсан, PDF бэлтгэж байна.'}
      </p>
    );
  }
  return null;
}
