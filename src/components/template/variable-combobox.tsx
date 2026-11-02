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
import { VariableKindBadge } from '@/components/variable/variable-kind-badge';
import { cn } from '@/lib/utils';
import type { ContractVariableType } from '@/queries/template/type';
import { variableFieldsOptions } from '@/queries/variable/options';
import {
  describeField,
  type VariableKind,
  VariableKindSchema,
  variableKindLabel,
} from '@/queries/variable/type';

/**
 * Picks a variable of the catalog, by group, of every kind or one, searching its label, note
 * and value. Each shows its kind; under its label a system one shows its note, a field one
 * what it reads and its example, and a custom one its text.
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
  const [kind, setKind] = useState<VariableKind | 'all'>('all');
  const { data: catalog } = useQuery(variableFieldsOptions());
  const selected = variables.find((v) => v.key === value);
  const shown = variables.filter((v) => kind === 'all' || v.kind === kind);
  const groups = [...new Set(shown.map((v) => v.group))];
  const notesOf = (v: ContractVariableType): string[] => {
    if (v.kind === 'custom') {
      return [v.value_mn ?? ''];
    }
    if (v.kind === 'field') {
      return [describeField(catalog, v), v.hint && `жишээ: ${v.hint}`];
    }
    return [v.hint];
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setKind('all');
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className="h-9 w-full justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected && <VariableKindBadge kind={selected.kind} compact />}
            <span
              className={cn('truncate', !selected && 'text-muted-foreground')}
            >
              {selected ? selected.label : 'Хувьсагч сонгох'}
            </span>
          </span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-80 p-0">
        <Command>
          <CommandInput placeholder="Хайх: нэр, огноо, дүн" />
          <div className="flex flex-wrap gap-1 border-b p-2">
            {(['all', ...VariableKindSchema.options] as const).map((k) => (
              <Button
                key={k}
                type="button"
                size="sm"
                variant={kind === k ? 'secondary' : 'ghost'}
                aria-pressed={kind === k}
                className="h-7 px-2 text-xs"
                onClick={() => setKind(k)}
              >
                {k === 'all' ? 'Бүгд' : variableKindLabel[k]}
              </Button>
            ))}
          </div>
          <CommandList>
            <CommandEmpty>Хувьсагч олдсонгүй</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group} heading={group}>
                {shown
                  .filter((v) => v.group === group)
                  .map((v) => (
                    <CommandItem
                      key={v.key}
                      // Searched by what admins read; the key only keeps it unique.
                      value={`${v.label} ${notesOf(v).join(' ')} ${v.key}`}
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
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{v.label}</p>
                        {notesOf(v)
                          .filter(Boolean)
                          .map((note) => (
                            <p
                              key={note}
                              className="truncate text-xs text-muted-foreground"
                            >
                              {note}
                            </p>
                          ))}
                        {v.row && (
                          <p className="text-xs text-muted-foreground">
                            Хүснэгтийн мөр бүрт давтагдана
                          </p>
                        )}
                      </div>
                      <VariableKindBadge kind={v.kind} />
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
