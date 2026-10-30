import { queryOptions } from '@tanstack/react-query';
import { getWords } from './query';
import type { WordCategory } from './type';

export const wordKeys = {
  all: ['words'] as const,
  list: (category: WordCategory) => [...wordKeys.all, category] as const,
};

export function wordsOptions(category: WordCategory) {
  return queryOptions({
    queryKey: wordKeys.list(category),
    queryFn: () => getWords(category),
  });
}
