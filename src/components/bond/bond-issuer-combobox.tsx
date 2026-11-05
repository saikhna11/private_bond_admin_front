import { useQuery } from '@tanstack/react-query';
import { CheckIcon, ChevronsUpDownIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { issuerOptions, issuersOptions } from '@/queries/issuer/options';

/**
 * Picks an issuer, searched on the server by name or register number. Warns when the picked
 * issuer holds no bank account in currency, which the API refuses (bond.issuer_account_missing).
 */
export function BondIssuerCombobox({
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
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const q = useDebouncedValue(text.trim(), 250);
  const { data, isFetching } = useQuery({
    ...issuersOptions({ page: 1, q: q || undefined }),
    enabled: open,
  });
  const { data: picked } = useQuery({
    ...issuerOptions(value),
    enabled: !!value,
  });
  const items = data?.items ?? [];
  const missing =
    picked && !picked.bank_accounts.some((a) => a.currency === currency);

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) setText('');
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            className="h-10 w-full justify-between font-normal"
          >
            {picked ? (
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="truncate">{picked.name}</span>
                <span className="tabular text-xs text-muted-foreground">
                  {picked.register_number}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Бонд гаргагч сонгох</span>
            )}
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0">
          <Command shouldFilter={false}>
            <CommandInput
              value={text}
              onValueChange={setText}
              placeholder="Нэр эсвэл регистр"
            />
            <CommandList>
              {isFetching && !items.length ? (
                <div className="flex justify-center py-6 text-muted-foreground">
                  <Loader2Icon className="size-4 animate-spin" />
                </div>
              ) : (
                <CommandEmpty>Бонд гаргагч олдсонгүй</CommandEmpty>
              )}
              {items.map((i) => (
                <CommandItem
                  key={i.id}
                  value={i.id}
                  onSelect={() => {
                    onChange(i.id);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'size-4',
                      i.id === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{i.name}</span>
                  <span className="tabular text-xs text-muted-foreground">
                    {i.register_number}
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {missing && (
        <p className="text-sm text-warning-foreground dark:text-warning">
          Энэ бонд гаргагчид {currency} данс бүртгэгдээгүй байна.
        </p>
      )}
    </div>
  );
}
