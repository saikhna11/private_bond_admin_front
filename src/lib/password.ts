import * as z from 'zod';

export const passwordRules = [
  {
    key: 'length',
    label: 'Хамгийн багадаа 8 тэмдэгт',
    test: (v: string) => v.length >= 8,
  },
  { key: 'upper', label: 'Том үсэг', test: (v: string) => /\p{Lu}/u.test(v) },
  { key: 'lower', label: 'Жижиг үсэг', test: (v: string) => /\p{Ll}/u.test(v) },
  { key: 'digit', label: 'Тоо', test: (v: string) => /\d/.test(v) },
  {
    key: 'symbol',
    label: 'Тусгай тэмдэгт (!@#$%...)',
    test: (v: string) => /[^\p{L}\p{N}\s]/u.test(v),
  },
] as const;

export const passwordSchema = z
  .string()
  .max(128, 'Нууц үг хэт урт байна')
  .refine((v) => passwordRules.every((r) => r.test(v)), {
    message: 'Нууц үг шаардлага хангахгүй байна',
  });

/** A 14-character password that passes the rule, from the browser's CSPRNG. */
export function generatePassword(): string {
  const sets = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',
    'abcdefghijkmnopqrstuvwxyz',
    '23456789',
    '!@#$%&*?',
  ];
  const all = sets.join('');
  const pick = (s: string) =>
    s[crypto.getRandomValues(new Uint32Array(1))[0] % s.length];
  const chars = [
    ...sets.map(pick),
    ...Array.from({ length: 10 }, () => pick(all)),
  ];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
