import z from 'zod';

export const VariableKindSchema = z.enum(['system', 'custom']);
export type VariableKind = z.infer<typeof VariableKindSchema>;

export const variableKindLabel: Record<VariableKind, string> = {
  system: 'Систем',
  custom: 'Нэмэлт',
};

/**
 * A variable as the variables page lists it, without the key templates map it by: a system
 * one is computed from the contract, a custom one prints the texts an admin keeps (the
 * Mongolian one in a Mongolian template, the English one in an English template, the
 * Mongolian one while it is empty). templates counts the templates that map it.
 */
export const AdminVariableSchema = z.object({
  id: z.uuid(),
  kind: VariableKindSchema,
  label: z.string(),
  group: z.string(),
  hint: z.string(),
  value_mn: z.string().optional(),
  value_en: z.string().optional(),
  templates: z.number(),
  updated_at: z.string().optional(),
});
export type AdminVariableType = z.infer<typeof AdminVariableSchema>;

/** The page's tabs: every variable, one kind, or the ones no template maps. */
export const VariableViewSchema = z.enum(['all', 'system', 'custom', 'unused']);
export type VariableView = z.infer<typeof VariableViewSchema>;

export interface VariableFilters {
  page?: number;
  view?: VariableView;
  group?: string;
  q?: string;
}

/** What an admin writes of a variable; a system one takes only its label, group and hint. */
export interface VariableBody {
  label: string;
  group?: string;
  hint?: string;
  value_mn?: string;
  value_en?: string;
}
