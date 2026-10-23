import { CircleCheckIcon, CircleXIcon, ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewStatus } from '@/queries/client/type';

const statuses: Record<
  ReviewStatus,
  { label: string; className: string; Icon: typeof ClockIcon }
> = {
  pending: {
    label: 'Хүлээгдэж буй',
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    Icon: ClockIcon,
  },
  approved: {
    label: 'Баталгаажсан',
    className: 'bg-success/12 text-success',
    Icon: CircleCheckIcon,
  },
  rejected: {
    label: 'Цуцлагдсан',
    className: 'bg-destructive/10 text-destructive',
    Icon: CircleXIcon,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ReviewStatus;
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
      {s.label}
    </span>
  );
}
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        active ? 'text-muted-foreground' : 'bg-destructive/10 text-destructive',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          active ? 'bg-success' : 'bg-destructive',
        )}
      />
      {active ? 'Идэвхтэй' : 'Хаагдсан'}
    </span>
  );
}
