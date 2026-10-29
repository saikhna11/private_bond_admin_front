import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import type { AdminContractDetailType } from '@/queries/contract/type';
import { ownershipLabel } from '@/queries/template/type';
import { ContractDocumentButton } from './contract-document-button';
import { ContractStatusBadge } from './contract-status-badge';
import { ContractStatusNote } from './contract-status-note';

/** The contract's number, status, kind and template, with its PDF download. */
export function ContractInfoCard({ c }: { c: AdminContractDetailType }) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight tabular">
                {c.contract_no ?? 'Дугаар олгоогүй'}
              </h1>
              <ContractStatusBadge status={c.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {ownershipLabel[c.ownership_type]} ·{' '}
              <Link
                to="/templates/$templateId"
                params={{ templateId: c.template.id }}
                className="font-medium text-foreground hover:underline"
              >
                {c.template.name}
              </Link>
              {c.template.ttd && ' · ТТД'} · үүссэн {formatDate(c.created_at)}
            </p>
          </div>
          <ContractDocumentButton c={c} />
        </div>
        <ContractStatusNote c={c} />
      </CardContent>
    </Card>
  );
}
