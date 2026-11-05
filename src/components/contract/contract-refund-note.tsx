import { BanknoteIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatAmount } from '@/lib/format';
import type { AdminContractDetailType } from '@/queries/contract/type';

/**
 * That a paid contract which ended, declined by the bond issuer's director or expired at
 * their turn, needs its payment refunded: no longer sold, its amount went back to the bond,
 * and finance returns the money by hand.
 */
export function ContractRefundNote({ c }: { c: AdminContractDetailType }) {
  if (!c.paid_on || (c.status !== 'cancelled' && c.status !== 'expired')) {
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
