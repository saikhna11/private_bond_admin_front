import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  ClockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type TransferStatus, transferStatusLabel } from '@/queries/bank/type';

const statuses: Record<
  TransferStatus,
  { className: string; Icon: typeof ClockIcon }
> = {
  pending: {
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    Icon: ClockIcon,
  },
  sent: { className: 'bg-success/12 text-success', Icon: CircleCheckIcon },
  failed: {
    className: 'bg-destructive/10 text-destructive',
    Icon: CircleXIcon,
  },
  unknown: {
    className: 'bg-muted text-muted-foreground',
    Icon: CircleHelpIcon,
  },
};

export function TransferStatusBadge({
  status,
  className,
}: {
  status: TransferStatus;
  className?: string;
}) {
  const s = statuses[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        s.className,
        className,
      )}
    >
      <s.Icon className="size-3.5" />
      {transferStatusLabel[status]}
    </span>
  );
}
