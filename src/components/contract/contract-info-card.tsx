import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/format';
import type { AdminContractDetailType } from '@/queries/contract/type';
import { ownershipLabel } from '@/queries/template/type';
import { ContractDocumentButton } from './contract-document-button';
import { ContractStatusBadge } from './contract-status-badge';
import { ContractStatusDate } from './contract-status-date';
import { ContractStatusNote } from './contract-status-note';
import { InfoItem } from './info-item';

/** The contract's number and status, its kind, template and dates, with its PDF download. */
export function ContractInfoCard({ c }: { c: AdminContractDetailType }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight tabular">
              {c.contract_no ?? 'Дугаар олгоогүй'}
            </h1>
            <ContractStatusBadge status={c.status} />
          </div>
          <ContractDocumentButton c={c} />
        </div>
        <dl className="grid gap-x-6 gap-y-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Төрөл"
            value={`${ownershipLabel[c.ownership_type]}${c.template.ttd ? ' · ТТД' : ''}`}
          />
          <InfoItem
            label="Загвар"
            value={
              <Link
                to="/templates/$templateId"
                params={{ templateId: c.template.id }}
                className="hover:underline"
              >
                {c.template.name}
              </Link>
            }
          />
          <InfoItem label="Үүссэн огноо" value={formatDateTime(c.created_at)} />
          <ContractStatusDate c={c} />
        </dl>
        <ContractStatusNote c={c} />
      </CardContent>
    </Card>
  );
}
