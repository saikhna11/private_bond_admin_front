import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type VariableKind, variableKindLabel } from '@/queries/variable/type';

/** Each kind's dot: computed, read from the data, or an admin's text. */
const dots: Record<VariableKind, string> = {
  system: 'bg-sky-500',
  field: 'bg-success',
  custom: 'bg-warning',
};

/**
 * What kind a variable is, by a coloured dot and its name; compact shows the dot alone,
 * named for screen readers and on hover.
 */
export function VariableKindBadge({
  kind,
  compact,
}: {
  kind: VariableKind;
  compact?: boolean;
}) {
  const dot = (
    <span className={cn('size-1.5 shrink-0 rounded-full', dots[kind])} />
  );
  if (compact) {
    return (
      <span
        role="img"
        aria-label={variableKindLabel[kind]}
        title={variableKindLabel[kind]}
        className="inline-flex size-4 shrink-0 items-center justify-center"
      >
        {dot}
      </span>
    );
  }
  return (
    <Badge variant="outline" className="shrink-0 gap-1.5 font-normal">
      {dot}
      {variableKindLabel[kind]}
    </Badge>
  );
}
