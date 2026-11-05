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
import { issuerOptions, issuersOptions } from '@/queries/issuer/options';
import type { IssuerSummaryType } from '@/queries/issuer/type';

const ALL = '__all';

/** An issuer's name with its register number. */
function label(i: Pick<IssuerSummaryType, 'name' | 'register_number'>) {
  return `${i.name} · ${i.register_number}`;
}

/**
 * Search bond issuers by the start of the name or register number, then pick one. The
 * select reports the issuer's id.
 */
export function IssuerPicker({
  value,
  onChange,
  clearable = false,
  placeholder = 'Бонд гаргагч сонгох',
  id,
  disabled,
}: {
  value?: string;
  onChange: (id: string | undefined) => void;
  /** Adds a "Бүх бонд гаргагч" option that reports undefined. */
  clearable?: boolean;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}) {
  const [q, setQ] = useState('');
  const { data, isPending } = useQuery(
    issuersOptions({ page: 1, q: q || undefined }),
  );
  const items = data?.items ?? [];
  const listed = items.find((i) => i.id === value);
  // The chosen issuer may be off the current page of results.
  const { data: detail } = useQuery({
    ...issuerOptions(value ?? ''),
    enabled: !!value && !listed,
  });
  const selected = listed ?? detail;
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
        placeholder="Нэр, регистрийн дугаар"
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
          {clearable && <SelectItem value={ALL}>Бүх бонд гаргагч</SelectItem>}
          {items.map((i) => (
            <SelectItem key={i.id} value={i.id}>
              {label(i)}
            </SelectItem>
          ))}
          {value && !listed && <SelectItem value={value}>{shown}</SelectItem>}
          {!isPending && !items.length && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Бонд гаргагч олдсонгүй
            </p>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
