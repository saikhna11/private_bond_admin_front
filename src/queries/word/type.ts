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
  builtin: z.boolean(),
  updated_at: z.string().optional(),
});
export type ContractWordType = z.infer<typeof ContractWordSchema>;

/** The categories admins add words to: banks and currencies, whose codes may grow. */
export const addableWordCategories: WordCategory[] = ['bank', 'currency'];

/** How a new word's code is asked for, by category. */
export const wordCodeField: Partial<
  Record<WordCategory, { label: string; hint: string; add: string }>
> = {
  bank: {
    label: 'Банкны нэр',
    hint: 'Харилцагчийн дансны банкны нэртэй яг ижил: Хас банк',
    add: 'Банк нэмэх',
  },
  currency: {
    label: 'Валютын код',
    hint: '3 латин том үсэг: EUR',
    add: 'Валют нэмэх',
  },
};
