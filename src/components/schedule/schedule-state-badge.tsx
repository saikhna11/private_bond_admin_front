import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  type ScheduleState,
  scheduleStateLabel,
} from '@/queries/schedule/type';

const tone: Record<ScheduleState, string> = {
  unpaid: 'border-border bg-muted text-muted-foreground',
  paying:
    'border-warning/40 bg-warning/10 text-warning-foreground dark:text-warning',
  paid: 'border-success/40 bg-success/10 text-success',
};

/** A schedule row's state: unpaid, being paid (its payout is pending) or paid. */
export function ScheduleStateBadge({ state }: { state: ScheduleState }) {
  return (
    <Badge variant="outline" className={cn('font-normal', tone[state])}>
      {scheduleStateLabel[state]}
    </Badge>
  );
}
