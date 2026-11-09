import { useQuery } from '@tanstack/react-query';
import { formatDateTime, formatMoney } from '@/lib/format';
import { transfersOptions } from '@/queries/bank/options';
import { transferStatusLabel } from '@/queries/bank/type';

/**
 * The refunds sent for a contract, newest first: when, how much, their status and reason. A
 * failed one gave nothing back, so the contract has it left to refund again.
 */
export function ContractRefundHistory({ contractId }: { contractId: string }) {
  const { data } = useQuery(transfersOptions({ contract_id: contractId }));
  const refunds = (data?.items ?? []).filter(
    (t) => t.direction === 'outbound' && t.purpose === 'refund',
  );
  if (refunds.length === 0) return null;
  return (
    <div className="space-y-2 rounded-lg border p-3 text-sm">
      <p className="font-medium">Буцаалтын түүх</p>
      <ul className="space-y-1.5">
        {refunds.map((t) => (
          <li key={t.id} className="flex flex-wrap justify-between gap-x-3">
            <span className="tabular">
              {formatDateTime(t.created_at)} ·{' '}
              {formatMoney(t.amount, t.currency)} · {t.to_holder_name}
            </span>
            <span
              className={
                t.status === 'failed'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }
            >
              {transferStatusLabel[t.status]}
              {t.refund_reason ? ` · ${t.refund_reason}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
