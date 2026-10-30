import * as z from 'zod';
import fetchAndValidate from '@/lib/fetcher';
import { listQuery } from '@/lib/types';
import { ContractWordSchema, type WordCategory } from './type';

export const getWords = (category: WordCategory) =>
  fetchAndValidate(
    `words${listQuery({ category })}`,
    z.array(ContractWordSchema),
  );

export const updateWord = (
  category: WordCategory,
  code: string,
  body: { value_mn: string; value_en: string },
) =>
  fetchAndValidate(
    `words/${category}/${encodeURIComponent(code)}`,
    ContractWordSchema,
    { method: 'PUT', body },
  );
