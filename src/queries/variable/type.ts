import z from 'zod';
import { WordCategorySchema, wordCategoryLabel } from '@/queries/word/type';

export const VariableKindSchema = z.enum(['system', 'field', 'custom']);
export type VariableKind = z.infer<typeof VariableKindSchema>;

/** The dynamic kinds, whose value a contract's data gives: the computed and the field ones. */
export const dynamicKinds: VariableKind[] = ['system', 'field'];

/**
 * A variable as the variables page lists it, without the key templates map it by: a system
 * one is computed from the contract, a field one prints a field of the contract or of a party
 * (source, field) in a format, a custom one prints the texts an admin keeps (the Mongolian one
 * in a Mongolian template, the English one in an English template, the Mongolian one while
 * it is empty). A builtin one is the service's: admins rename it but never delete it.
 * templates counts the templates that map it.
 */
export const AdminVariableSchema = z.object({
  id: z.uuid(),
  kind: VariableKindSchema,
  builtin: z.boolean(),
  source: z.string().optional(),
  field: z.string().optional(),
  format: z.string().optional(),
  label: z.string(),
  group: z.string(),
  hint: z.string(),
  value_mn: z.string().optional(),
  value_en: z.string().optional(),
  templates: z.number(),
  updated_at: z.string().optional(),
});
export type AdminVariableType = z.infer<typeof AdminVariableSchema>;

/** The variables tab's views: every dynamic variable, one kind, or the ones no template maps. */
export const VariableViewSchema = z.enum(['all', 'system', 'field', 'unused']);
export type VariableView = z.infer<typeof VariableViewSchema>;

/** The dynamic kinds view lists. */
export function viewKinds(view: VariableView): VariableKind[] {
  return view === 'system' || view === 'field' ? [view] : dynamicKinds;
}

/** The static values tab's tabs: the admins' fixed texts, then each category of words. */
export const StaticCategorySchema = z.enum([
  'text',
  ...WordCategorySchema.options,
]);
export type StaticCategory = z.infer<typeof StaticCategorySchema>;

export const staticCategoryLabel: Record<StaticCategory, string> = {
  text: 'Тогтмол текст',
  ...wordCategoryLabel,
};

/** A page of the variables of kinds, only the ones no template maps when unused. */
export interface VariableFilters {
  kinds: VariableKind[];
  unused?: boolean;
  page?: number;
  group?: string;
  q?: string;
}

/**
 * What an admin writes of a variable: kind only on creation, a field one's source, field and
 * format, a custom one's values. A builtin one takes only its label, group and hint.
 */
export interface VariableBody {
  kind?: 'field' | 'custom';
  label: string;
  group?: string;
  hint?: string;
  source?: string;
  field?: string;
  format?: string;
  value_mn?: string;
  value_en?: string;
}

/**
 * What a field variable picks from: the sources, the contract, the holder and the co-holder,
 * with their fields and the formats each prints in, and every format with an example. A
 * party's fields are its person's columns a comment names and the service's special ones;
 * note says whose persons have one, such as citizens only.
 */
export const VariableFieldCatalogSchema = z.object({
  sources: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      fields: z.array(
        z.object({
          key: z.string(),
          label: z.string(),
          note: z.string().optional(),
          formats: z.array(z.string()),
        }),
      ),
    }),
  ),
  formats: z.array(
    z.object({ key: z.string(), label: z.string(), example: z.string() }),
  ),
});
export type VariableFieldCatalogType = z.infer<
  typeof VariableFieldCatalogSchema
>;

/**
 * Names what a field variable reads as admins read it, «Эзэмшигч · Овог · Том үсгээр»: empty
 * while the catalog loads, a key the catalog no longer has as it is.
 */
export function describeField(
  catalog: VariableFieldCatalogType | undefined,
  v: { source?: string; field?: string; format?: string },
): string {
  if (!catalog) {
    return '';
  }
  const source = catalog.sources.find((s) => s.key === v.source);
  const field = source?.fields.find((f) => f.key === v.field);
  const format = catalog.formats.find((f) => f.key === v.format);
  return [
    source?.label ?? v.source,
    field?.label ?? v.field,
    format?.label ?? v.format,
  ]
    .filter(Boolean)
    .join(' · ');
}
