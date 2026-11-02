import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type WordCategory,
  WordCategorySchema,
  wordCategoryLabel,
} from '@/queries/word/type';

/** The dictionary tab's tabs: one per category of words. */
export function WordCategoryTabs({
  value,
  onChange,
}: {
  value: WordCategory;
  onChange: (category: WordCategory) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(WordCategorySchema.parse(v))}
    >
      <TabsList className="w-full sm:w-fit">
        {WordCategorySchema.options.map((c) => (
          <TabsTrigger key={c} value={c}>
            {wordCategoryLabel[c]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
