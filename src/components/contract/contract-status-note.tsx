import { TriangleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDateTime } from '@/lib/format';
import type { AdminContractDetailType } from '@/queries/contract/type';

/** What the contract's status means for it now: its deadline, end, or failed rendering. */
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
  const text: Partial<Record<AdminContractDetailType['status'], string>> = {
    pending_signature: `Гарын үсэг зурах хугацаа: ${formatDateTime(c.signature_deadline)}`,
    rendering:
      c.render_attempts > 0
        ? `PDF бэлтгэж байна, ${c.render_attempts} удаа бүтэлгүйтсэн тул дахин оролдож байна`
        : 'Бүх тал гарын үсэг зурсан, PDF бэлтгэж байна',
    signed: `Байгуулсан: ${formatDateTime(c.signed_at)}`,
    cancelled: `Татгалзсан: ${formatDateTime(c.cancelled_at)}`,
    expired: `Гарын үсэг зурах хугацаа дууссан: ${formatDateTime(c.cancelled_at)}`,
  };
  return <p className="text-sm text-muted-foreground">{text[c.status]}</p>;
}
