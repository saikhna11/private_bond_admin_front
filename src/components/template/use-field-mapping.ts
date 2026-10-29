import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { templateKeys } from '@/queries/template/options';
import { mapTemplateFields } from '@/queries/template/query';
import type {
  FieldMappingBody,
  TemplateDetailType,
  TemplateFieldType,
} from '@/queries/template/type';

/** A field as stored, in the shape the mapping is saved in. */
function stored(f: TemplateFieldType): FieldMappingBody {
  return {
    placeholder: f.placeholder,
    source: f.source,
    variable: f.variable,
    fixed_value: f.fixed_value,
  };
}

/**
 * The admin's unsaved changes to a draft template's mapping, by placeholder, and their
 * save: only the changed fields are sent, and the saved template replaces the cached one.
 */
export function useFieldMapping(t: TemplateDetailType) {
  const queryClient = useQueryClient();
  const [changes, setChanges] = useState<Record<string, FieldMappingBody>>({});

  const mappingOf = useCallback(
    (f: TemplateFieldType) => changes[f.placeholder] ?? stored(f),
    [changes],
  );

  const change = useCallback(
    (f: TemplateFieldType, patch: Partial<FieldMappingBody>) =>
      setChanges((prev) => ({
        ...prev,
        [f.placeholder]: {
          ...(prev[f.placeholder] ?? stored(f)),
          ...patch,
        },
      })),
    [],
  );

  // The placeholders still unmapped once the unsaved changes count, in document order.
  const unmapped = t.fields
    .filter((f) => mappingOf(f).source === 'unmapped')
    .map((f) => f.placeholder);

  const pending = Object.values(changes);
  // A variable source waits for its variable before it can be saved.
  const incomplete = pending.some(
    (c) => c.source === 'variable' && !c.variable,
  );

  async function save() {
    const saved = await mapTemplateFields(
      t.id,
      pending.map((c) => ({
        placeholder: c.placeholder,
        source: c.source,
        variable: c.source === 'variable' ? c.variable : undefined,
        fixed_value: c.source === 'fixed' ? (c.fixed_value ?? '') : undefined,
      })),
    );
    queryClient.setQueryData(templateKeys.detail(t.id), saved);
    setChanges({});
    await queryClient.invalidateQueries({ queryKey: templateKeys.all });
  }

  return {
    changes,
    mappingOf,
    change,
    unmapped,
    dirty: pending.length > 0,
    incomplete,
    save,
    discard: () => setChanges({}),
  };
}

export type FieldMapping = ReturnType<typeof useFieldMapping>;
