import { StarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BankStatus, bankStatusLabel } from '@/queries/issuer/type';

/** A recipient account's bank check status; unverified when the API left it out. */
export function BankStatusBadge({
  status,
  className,
}: {
  status?: string;
  className?: string;
}) {
  const s =
    bankStatusLabel[(status ?? 'unverified') as BankStatus] ??
    bankStatusLabel.unverified;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        s.className,
        className,
      )}
    >
      {s.label}
    </span>
  );
}

/** Marks the currency's default account: payments use it unless another is picked. */
export function DefaultBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-primary',
        className,
      )}
    >
      <StarIcon className="size-3" />
      Үндсэн
    </span>
  );
}

/** The account's currency, as a small mono tag. */
export function CurrencyTag({ currency }: { currency: string }) {
  return (
    <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
      {currency}
    </span>
  );
}
