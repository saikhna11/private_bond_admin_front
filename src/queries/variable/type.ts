import z from 'zod';

/** The prefix of every admin's variable key; the admin writes the rest. */
export const customPrefix = 'custom.';

/**
 * A variable an admin defines: a text every template can print, the Mongolian value in a
 * Mongolian template, the English one in an English template (the Mongolian one when empty).
 * templates counts the templates that map it; one mapped cannot be deleted.
 */
export const CustomVariableSchema = z.object({
  id: z.uuid(),
  key: z.string(),
  label: z.string(),
  group: z.string(),
  value_mn: z.string(),
  value_en: z.string(),
  templates: z.number(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type CustomVariableType = z.infer<typeof CustomVariableSchema>;

/** What an admin writes of their variable; key only when creating it. */
export interface CustomVariableBody {
  key?: string;
  label: string;
  group?: string;
  value_mn: string;
  value_en?: string;
}
