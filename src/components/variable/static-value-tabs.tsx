import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type StaticCategory,
  StaticCategorySchema,
  staticCategoryLabel,
} from '@/queries/variable/type';

/** The static values tab's tabs: the admins' fixed texts, then each category of words. */
export function StaticValueTabs({
  value,
  onChange,
}: {
  value: StaticCategory;
  onChange: (category: StaticCategory) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(StaticCategorySchema.parse(v))}
    >
      <TabsList className="w-full sm:w-fit">
        {StaticCategorySchema.options.map((c) => (
          <TabsTrigger key={c} value={c}>
            {staticCategoryLabel[c]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
