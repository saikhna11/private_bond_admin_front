import { useState } from 'react';
import type { TemplateFieldType } from '@/queries/template/type';
import type { FieldMapping } from './use-field-mapping';

/**
 * Narrows the mapping table to the placeholders left to map. The ones unmapped when it is
 * turned on stay while they are mapped, and one unmapped again joins them.
 */
export function useUnmappedFilter(mapping: FieldMapping) {
  const [only, setOnly] = useState<Set<string> | null>(null);

  return {
    on: only !== null,
    showUnmapped: () => setOnly(new Set(mapping.unmapped)),
    showAll: () => setOnly(null),
    rowsOf: (fields: TemplateFieldType[]) =>
      only
        ? fields.filter(
            (f) =>
              only.has(f.placeholder) ||
              mapping.unmapped.includes(f.placeholder),
          )
        : fields,
  };
}

export type UnmappedFilter = ReturnType<typeof useUnmappedFilter>;
