import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ContractVariableType } from '@/queries/template/type';

/** Picks a variable of the catalog, by group, searching its label and key. */
export function VariableCombobox({
  value,
  variables,
  onChange,
  invalid,
}: {
  value?: string;
  variables: ContractVariableType[];
  onChange: (key: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = variables.find((v) => v.key === value);
  const groups = [...new Set(variables.map((v) => v.group))];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className="h-9 w-full justify-between font-normal"
        >
          <span
            className={cn('truncate', !selected && 'text-muted-foreground')}
          >
            {selected ? selected.label : 'Хувьсагч сонгох'}
          </span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-80 p-0">
        <Command>
          <CommandInput placeholder="Хайх: нэр, дүн, holder.phone" />
          <CommandList>
            <CommandEmpty>Хувьсагч олдсонгүй</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group} heading={group}>
                {variables
                  .filter((v) => v.group === group)
                  .map((v) => (
                    <CommandItem
                      key={v.key}
                      value={`${v.label} ${v.key}`}
                      onSelect={() => {
                        onChange(v.key);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'size-4',
                          v.key === value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className="min-w-0">
                        <p className="truncate">{v.label}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {v.key}
                          {v.row && ' · хуваарийн мөр'}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
