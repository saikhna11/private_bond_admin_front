import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Frequency } from '@/queries/bond/type';
import { termChoices } from './rate-option-rules';

/** A term in months, picked from the ones frequency takes, from from on. */
export function TermSelect({
  value,
  onChange,
  frequency,
  from,
  id,
  label,
  invalid,
}: {
  value: number;
  onChange: (term: number) => void;
  frequency: Frequency;
  from?: number;
  id?: string;
  label: string;
  invalid?: boolean;
}) {
  const choices = termChoices(frequency, from);
  return (
    <Select
      value={choices.includes(value) ? String(value) : ''}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        aria-invalid={invalid}
        className="tabular h-10! w-full"
      >
        <SelectValue placeholder="Сонгох" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {choices.map((t) => (
          <SelectItem key={t} value={String(t)}>
            {t} сар
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
