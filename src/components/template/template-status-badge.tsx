import { CircleCheckIcon, CircleDashedIcon, CircleOffIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type TemplateStatus,
  templateStatusLabel,
} from '@/queries/template/type';

const styles: Record<
  TemplateStatus,
  { className: string; Icon: typeof CircleCheckIcon }
> = {
  draft: {
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    Icon: CircleDashedIcon,
  },
  active: { className: 'bg-success/12 text-success', Icon: CircleCheckIcon },
  inactive: {
    className: 'bg-muted text-muted-foreground',
    Icon: CircleOffIcon,
  },
};

export function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  const s = styles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        s.className,
      )}
    >
      <s.Icon className="size-3.5" />
      {templateStatusLabel[status]}
    </span>
  );
}
