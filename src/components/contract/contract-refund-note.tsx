import { Link } from '@tanstack/react-router';
import { BanknoteIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCan } from '@/hooks/use-can';
import { formatAmount } from '@/lib/format';
import { PRIV } from '@/lib/rbac';
import type { AdminContractDetailType } from '@/queries/contract/type';

/**
 * The money the contract received and must give back, per currency: an order paid over its
 * amount, money that came after it lapsed, was cancelled or already paid, or a paid contract
 * that ended unsigned. A contract paid with the test button has no bank money: its note says
 * finance returns it by hand.
 */
export function ContractRefundNote({ c }: { c: AdminContractDetailType }) {
  const can = useCan();
  const due = (c.payment?.money ?? []).filter((m) => Number(m.refundable) > 0);
  if (due.length > 0) {
    return (
      <Alert className="border-warning/40 bg-warning/10">
        <BanknoteIcon className="text-warning-foreground dark:text-warning" />
        <AlertTitle className="mb-1">Төлбөрийг буцаах шаардлагатай</AlertTitle>
        <AlertDescription>
          <span>
            Буцаах дүн:{' '}
            {due.map((m) => formatAmount(m.refundable, m.currency)).join(', ')}.{' '}
            {can(PRIV.paymentList) ? (
              <Link
                to="/bank/payments"
                search={{ tab: 'refund' }}
                className="font-medium underline"
              >
                Анхаарах төлбөр
              </Link>
            ) : (
              'Анхаарах төлбөр'
            )}{' '}
            хуудаснаас буцаана.
          </span>
        </AlertDescription>
      </Alert>
    );
  }
  if (
    !c.paid_on ||
    c.payment_source !== 'mock' ||
    (c.status !== 'cancelled' && c.status !== 'expired')
  ) {
    return null;
  }
  return (
    <Alert className="border-warning/40 bg-warning/10">
      <BanknoteIcon className="text-warning-foreground dark:text-warning" />
      <AlertTitle className="mb-1">Төлбөрийг буцаах шаардлагатай</AlertTitle>
      <AlertDescription>
        Харилцагчийн төлсөн {formatAmount(c.principal_amount, c.currency)}-ийг
        гараар буцаана. Гэрээний дүн бондын үлдэгдэлд буцаж орсон.
      </AlertDescription>
    </Alert>
  );
}
