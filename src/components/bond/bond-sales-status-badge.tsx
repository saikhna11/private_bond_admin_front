import {
  CircleCheckIcon,
  CircleOffIcon,
  CirclePauseIcon,
  ClockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type SalesStatus, salesStatusLabel } from '@/queries/bond/type';

const styles: Record<
  SalesStatus,
  { className: string; Icon: typeof CircleCheckIcon }
> = {
  upcoming: { className: 'bg-primary/10 text-primary', Icon: ClockIcon },
  selling: { className: 'bg-success/12 text-success', Icon: CircleCheckIcon },
  paused: {
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    Icon: CirclePauseIcon,
  },
  closed: { className: 'bg-muted text-muted-foreground', Icon: CircleOffIcon },
};

/** Whether a bond takes purchases today (bond.md 5.1). */
export function BondSalesStatusBadge({ status }: { status: SalesStatus }) {
  const s = styles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        s.className,
      )}
    >
      <s.Icon className="size-3.5" />
      {salesStatusLabel[status]}
    </span>
  );
}
