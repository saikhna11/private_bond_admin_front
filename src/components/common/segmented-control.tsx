import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

/** A choice among a few values, every one in sight; one is always picked. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  id,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  id?: string;
  label: string;
}) {
  return (
    <ToggleGroup
      id={id}
      type="single"
      spacing={1}
      aria-label={label}
      value={value}
      // A second click on the picked value would clear it: keep it instead.
      onValueChange={(v) => v && onChange(v as T)}
      className="h-10 w-full rounded-lg bg-muted p-1"
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className="tabular h-8 flex-1 text-muted-foreground hover:bg-transparent data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:data-[state=on]:bg-input"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
