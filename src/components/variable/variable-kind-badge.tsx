import {
  DatabaseIcon,
  type LucideIcon,
  SigmaIcon,
  TypeIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type VariableKind, variableKindLabel } from '@/queries/variable/type';

/** Each kind's icon and tint: computed, read from the data, or an admin's text. */
const kinds: Record<VariableKind, { icon: LucideIcon; tint: string }> = {
  system: {
    icon: SigmaIcon,
    tint: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  },
  field: { icon: DatabaseIcon, tint: 'bg-success/15 text-success' },
  custom: { icon: TypeIcon, tint: 'bg-warning/15 text-warning' },
};

/**
 * What kind a variable is, by an icon and its name; compact shows the icon alone, named for
 * screen readers and on hover.
 */
export function VariableKindBadge({
  kind,
  compact,
  className,
}: {
  kind: VariableKind;
  compact?: boolean;
  className?: string;
}) {
  const { icon: Icon, tint } = kinds[kind];
  const label = variableKindLabel[kind];
  if (compact) {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex size-5 shrink-0 items-center justify-center rounded',
          tint,
          className,
        )}
      >
        <Icon className="size-3.5" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tint,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
