import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
  ContractVariableType,
  FieldMappingBody,
  FieldSource,
} from '@/queries/template/type';
import { fieldRowId } from './use-row-focus';
import { VariableCombobox } from './variable-combobox';

const sourceLabel: Record<FieldSource, string> = {
  unmapped: 'Холбоогүй',
  variable: 'Хувьсагч',
  fixed: 'Тогтмол текст',
};

/**
 * One placeholder and what fills it; editable while the template is a draft. An unmapped one
 * is marked, and a focused one highlighted while the problems list points at it.
 */
export function FieldMappingRow({
  value,
  variables,
  changed,
  focused,
  readOnly,
  onChange,
}: {
  value: FieldMappingBody;
  variables: ContractVariableType[];
  changed: boolean;
  focused: boolean;
  readOnly: boolean;
  onChange: (patch: Partial<FieldMappingBody>) => void;
}) {
  const variable = variables.find((v) => v.key === value.variable);
  const unmapped = value.source === 'unmapped';
  return (
    <TableRow
      id={fieldRowId(value.placeholder)}
      className={cn(
        'transition-colors duration-500',
        changed && 'bg-primary/5 hover:bg-primary/5',
        unmapped && 'bg-warning/8 hover:bg-warning/12',
        focused && 'bg-primary/15 hover:bg-primary/15',
      )}
    >
      <TableCell
        className={cn(
          'border-l-2 border-l-transparent pl-4 align-top',
          unmapped && 'border-l-warning',
        )}
      >
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {`{${value.placeholder}}`}
        </code>
      </TableCell>
      <TableCell className="w-44 align-top">
        {readOnly ? (
          <span className="text-sm text-muted-foreground">
            {sourceLabel[value.source]}
          </span>
        ) : (
          <Select
            value={value.source}
            onValueChange={(v) => onChange({ source: v as FieldSource })}
          >
            <SelectTrigger
              className={cn(
                'h-9! w-full',
                unmapped &&
                  'border-warning text-warning-foreground dark:text-warning',
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(sourceLabel) as FieldSource[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {sourceLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </TableCell>
      <TableCell className="pr-4 align-top">
        {value.source === 'variable' &&
          (readOnly ? (
            <p className="text-sm">
              {variable?.label ?? value.variable}
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                {value.variable}
              </span>
            </p>
          ) : (
            <VariableCombobox
              value={value.variable}
              variables={variables}
              invalid={!value.variable}
              onChange={(key) => onChange({ variable: key })}
            />
          ))}
        {value.source === 'fixed' &&
          (readOnly ? (
            <p className="text-sm">{value.fixed_value || '(хоосон)'}</p>
          ) : (
            <Input
              className="h-9"
              maxLength={1000}
              placeholder="Гэрээнд хэвлэгдэх текст"
              value={value.fixed_value ?? ''}
              onChange={(e) => onChange({ fixed_value: e.target.value })}
            />
          ))}
        {unmapped && (
          <span className="text-sm text-warning-foreground dark:text-warning">
            {readOnly ? '-' : '← Хувьсагч эсвэл тогтмол текст сонгоно уу'}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}
