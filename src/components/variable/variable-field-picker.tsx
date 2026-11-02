import { FormField } from '@/components/common/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VariableFieldCatalogType } from '@/queries/variable/type';

/** What a field variable reads: a source, one of its fields, and a format of that field. */
export interface FieldPick {
  source: string;
  field: string;
  format: string;
}

type Source = VariableFieldCatalogType['sources'][number];

/**
 * Picks what a field variable reads, its source, then a field of it, then a format of that
 * field, each offering only what the one before allows. A pick the next source or field
 * lacks is cleared, and a field takes its first format when the one picked does not fit.
 */
export function VariableFieldPicker({
  catalog,
  value,
  errors,
  onChange,
}: {
  catalog?: VariableFieldCatalogType;
  value: FieldPick;
  errors: Partial<Record<keyof FieldPick, string>>;
  onChange: (next: FieldPick) => void;
}) {
  const source = catalog?.sources.find((s) => s.key === value.source);
  const field = source?.fields.find((f) => f.key === value.field);
  const format = catalog?.formats.find((f) => f.key === value.format);

  // The field and format of s that keep as much of the current pick as s allows.
  const fieldOf = (s: Source | undefined, key: string) => {
    const f = s?.fields.find((x) => x.key === key);
    if (!f) {
      return { field: '', format: '' };
    }
    return {
      field: f.key,
      format: f.formats.includes(value.format)
        ? value.format
        : (f.formats[0] ?? ''),
    };
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id="source" label="Мэдээлэл" error={errors.source}>
        <Select
          value={value.source}
          onValueChange={(key) =>
            onChange({
              source: key,
              ...fieldOf(
                catalog?.sources.find((s) => s.key === key),
                value.field,
              ),
            })
          }
        >
          <SelectTrigger
            id="source"
            className="h-10! w-full"
            aria-invalid={!!errors.source}
          >
            <SelectValue placeholder="Сонгох" />
          </SelectTrigger>
          <SelectContent>
            {catalog?.sources.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id="field" label="Талбар" error={errors.field}>
        <Select
          value={value.field}
          disabled={!source}
          onValueChange={(key) =>
            onChange({ source: value.source, ...fieldOf(source, key) })
          }
        >
          <SelectTrigger
            id="field"
            className="h-10! w-full"
            aria-invalid={!!errors.field}
          >
            <SelectValue placeholder="Сонгох" />
          </SelectTrigger>
          <SelectContent>
            {source?.fields.map((f) => (
              <SelectItem key={f.key} value={f.key}>
                {f.label}
                {f.note && (
                  <span className="text-muted-foreground"> · {f.note}</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField
        id="format"
        label="Формат"
        error={errors.format}
        hint={format && `Жишээ: ${format.example}`}
      >
        <Select
          value={value.format}
          disabled={!field}
          onValueChange={(key) => onChange({ ...value, format: key })}
        >
          <SelectTrigger
            id="format"
            className="h-10! w-full"
            aria-invalid={!!errors.format}
          >
            <SelectValue placeholder="Сонгох" />
          </SelectTrigger>
          <SelectContent>
            {field?.formats.map((key) => (
              <SelectItem key={key} value={key}>
                {catalog?.formats.find((f) => f.key === key)?.label ?? key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
