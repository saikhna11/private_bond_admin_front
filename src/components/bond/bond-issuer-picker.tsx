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

/** An issuer's name with the register number an admin recognises it by. */
function label(i: IssuerSummaryType) {
  return `${i.name} · ${i.register_number}`;
}

/**
 * Search issuers by name or register number, then pick one. Warns when the picked issuer holds
 * no bank account in currency, which the API refuses (bond.issuer_account_missing).
 */
export function BondIssuerPicker({
  value,
  onChange,
  currency,
  id,
  invalid,
}: {
  value: string;
  onChange: (id: string) => void;
  currency: string;
  id?: string;
  invalid?: boolean;
}) {
  const [q, setQ] = useState('');
  const { data, isPending } = useQuery(
    issuersOptions({ page: 1, q: q || undefined }),
  );
  const { data: picked } = useQuery({
    ...issuerOptions(value),
    enabled: !!value,
  });
  const items = data?.items ?? [];
  const selected = items.find((i) => i.id === value) ?? picked;
  const missing =
    picked && !picked.bank_accounts.some((a) => a.currency === currency);

  return (
    <div className="space-y-2">
      <SearchInput value={q} onChange={setQ} placeholder="Нэр эсвэл регистр" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-invalid={invalid} className="h-10! w-full">
          <SelectValue placeholder="Бонд гаргагч сонгох">
            {selected ? label(selected) : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {items.map((i) => (
            <SelectItem key={i.id} value={i.id}>
              {label(i)}
            </SelectItem>
          ))}
          {value && !items.some((i) => i.id === value) && selected && (
            <SelectItem value={value}>{label(selected)}</SelectItem>
          )}
          {!isPending && !items.length && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Бонд гаргагч олдсонгүй
            </p>
          )}
        </SelectContent>
      </Select>
      {missing && (
        <p className="text-sm text-warning-foreground dark:text-warning">
          Энэ бонд гаргагчид {currency} данс бүртгэгдээгүй байна.
        </p>
      )}
    </div>
  );
}
