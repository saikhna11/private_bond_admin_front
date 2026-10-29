import {
  CircleCheckIcon,
  CircleXIcon,
  ClockAlertIcon,
  ClockIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type ContractStatus,
  contractStatusLabel,
} from '@/queries/contract/type';

const styles: Record<
  ContractStatus,
  { className: string; Icon: typeof CircleCheckIcon }
> = {
  pending_signature: {
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    Icon: ClockIcon,
  },
  rendering: { className: 'bg-primary/12 text-primary', Icon: Loader2Icon },
  signed: { className: 'bg-success/12 text-success', Icon: CircleCheckIcon },
  cancelled: {
    className: 'bg-muted text-muted-foreground',
    Icon: CircleXIcon,
  },
  expired: {
    className: 'bg-muted text-muted-foreground',
    Icon: ClockAlertIcon,
  },
  failed: {
    className: 'bg-destructive/12 text-destructive',
    Icon: TriangleAlertIcon,
  },
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const s = styles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        s.className,
      )}
    >
      <s.Icon className="size-3.5" />
      {contractStatusLabel[status]}
    </span>
  );
}
