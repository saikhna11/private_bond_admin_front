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
import { bondOptions, bondsOptions } from '@/queries/bond/options';

/**
 * Picks a bond, searched on the server by the start of its code or name. With allLabel, a
 * first item picks none (''), for a filter.
 */
export function BondCombobox({
  value,
  onChange,
  id,
  invalid,
  allLabel,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  id?: string;
  invalid?: boolean;
  allLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const q = useDebouncedValue(text.trim(), 250);
  const { data, isFetching } = useQuery({
    ...bondsOptions({ page: 1, q: q || undefined }),
    enabled: open,
  });
  const { data: picked } = useQuery({
    ...bondOptions(value),
    enabled: !!value,
  });
  const items = data?.items ?? [];
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
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
          className={cn('h-10 w-full justify-between font-normal', className)}
        >
          {value && picked ? (
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="font-mono text-sm">{picked.code}</span>
              <span className="truncate text-xs text-muted-foreground">
                {picked.name}
              </span>
            </span>
          ) : (
            <span className={cn(!allLabel && 'text-muted-foreground')}>
              {allLabel ?? 'Бонд сонгох'}
            </span>
          )}
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={text}
            onValueChange={setText}
            placeholder="Код эсвэл нэр"
          />
          <CommandList>
            {isFetching && !items.length ? (
              <div className="flex justify-center py-6 text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
              </div>
            ) : (
              <CommandEmpty>Бонд олдсонгүй</CommandEmpty>
            )}
            {allLabel && !q && (
              <CommandItem value="__all" onSelect={() => pick('')}>
                <CheckIcon
                  className={cn('size-4', value ? 'opacity-0' : 'opacity-100')}
                />
                {allLabel}
              </CommandItem>
            )}
            {items.map((b) => (
              <CommandItem key={b.id} value={b.id} onSelect={() => pick(b.id)}>
                <CheckIcon
                  className={cn(
                    'size-4',
                    b.id === value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="font-mono text-sm">{b.code}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {b.name}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
