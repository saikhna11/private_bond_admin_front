import z from 'zod';

export const WordCategorySchema = z.enum([
  'bank',
  'frequency',
  'currency',
  'id_label',
]);
export type WordCategory = z.infer<typeof WordCategorySchema>;

export const wordCategoryLabel: Record<WordCategory, string> = {
  bank: 'Банк',
  frequency: 'Хүү төлөх давтамж',
  currency: 'Валют',
  id_label: 'Бичиг баримт',
};

/**
 * What the contracts print for a code in each template language: a bank (code: its stored
 * name, printed without банк in Mongolian), an interest frequency, a currency or a party's
 * document.
 */
export const ContractWordSchema = z.object({
  category: WordCategorySchema,
  code: z.string(),
  value_mn: z.string(),
  value_en: z.string(),
  updated_at: z.string().optional(),
});
export type ContractWordType = z.infer<typeof ContractWordSchema>;
