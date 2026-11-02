import { useQuery } from '@tanstack/react-query';
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
import { variableFieldsOptions } from '@/queries/variable/options';
import { describeField } from '@/queries/variable/type';

/**
 * Picks a variable of the catalog, by group, searching its label, note and value. Under its
 * label a custom one shows its text, another its note, and a field one without a note what
 * it reads.
 */
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
  const { data: catalog } = useQuery(variableFieldsOptions());
  const selected = variables.find((v) => v.key === value);
  const groups = [...new Set(variables.map((v) => v.group))];
  const noteOf = (v: ContractVariableType) =>
    v.custom
      ? v.value_mn
      : v.hint || (v.kind === 'field' ? describeField(catalog, v) : '');

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
          <CommandInput placeholder="Хайх: нэр, огноо, дүн" />
          <CommandList>
            <CommandEmpty>Хувьсагч олдсонгүй</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group} heading={group}>
                {variables
                  .filter((v) => v.group === group)
                  .map((v) => (
                    <CommandItem
                      key={v.key}
                      // Searched by what admins read, a field's description only where it shows: the
                      // fuzzy search finds stray letters in a long text. The key only keeps it unique.
                      value={`${v.label} ${v.hint} ${v.value_mn ?? ''} ${v.kind === 'field' && !v.hint ? describeField(catalog, v) : ''} ${v.key}`}
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
                        {noteOf(v) && (
                          <p className="truncate text-xs text-muted-foreground">
                            {noteOf(v)}
                          </p>
                        )}
                        {v.row && (
                          <p className="text-xs text-muted-foreground">
                            Хүснэгтийн мөр бүрт давтагдана
                          </p>
                        )}
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
