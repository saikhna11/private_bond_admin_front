import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { SearchInput } from '@/components/common/list-parts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clientsOptions } from '@/queries/client/options';
import type { ClientSummaryType } from '@/queries/client/type';

const ALL = '__all';

/** A client's name with the identifier an admin recognises them by. */
function label(c: ClientSummaryType) {
  return [c.display_name, c.register_number || c.email || c.phone]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Search clients by name, email, phone or register number, then pick one. The API takes
 * the client's user id, which is what the select reports.
 */
export function ClientPicker({
  value,
  onChange,
  clearable = false,
  placeholder = 'Харилцагч сонгох',
  id,
  disabled,
}: {
  value?: string;
  onChange: (id: string | undefined) => void;
  /** Adds a "Бүх харилцагч" option that reports undefined. */
  clearable?: boolean;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}) {
  const [q, setQ] = useState('');
  const { data, isPending } = useQuery(
    clientsOptions({ page: 1, q: q || undefined }, 20),
  );
  const items = data?.items ?? [];
  const selected = items.find((c) => c.id === value);
  const shown = selected
    ? label(selected)
    : value
      ? `${value.slice(0, 8)}…`
      : undefined;

  return (
    <div className="space-y-2">
      <SearchInput
        value={q}
        onChange={setQ}
        placeholder="Нэр, имэйл, утас, РД"
      />
      <Select
        value={value || (clearable ? ALL : undefined)}
        onValueChange={(v) => onChange(v === ALL ? undefined : v)}
        disabled={disabled || isPending}
      >
        <SelectTrigger id={id} className="h-10! w-full">
          <SelectValue placeholder={placeholder}>{shown}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {clearable && <SelectItem value={ALL}>Бүх харилцагч</SelectItem>}
          {items.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {label(c)}
            </SelectItem>
          ))}
          {value && !selected && !clearable && (
            <SelectItem value={value}>{shown}</SelectItem>
          )}
          {!isPending && !items.length && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Харилцагч олдсонгүй
            </p>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
