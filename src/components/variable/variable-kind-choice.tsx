import { cn } from '@/lib/utils';
import type { VariableBody } from '@/queries/variable/type';

type Kind = NonNullable<VariableBody['kind']>;

const kinds: { value: Kind; title: string; text: string }[] = [
  {
    value: 'field',
    title: 'Гэрээний мэдээлэл',
    text: 'Гэрээ эсвэл аль нэг талын мэдээллийг сонгосон форматаар хэвлэнэ.',
  },
  {
    value: 'custom',
    title: 'Тогтмол текст',
    text: 'Таны бичсэн текстийг гэрээ бүрт ижилхэн хэвлэнэ.',
  },
];

/** Picks what a new variable prints: a field of the contract or a party, or an admin's text. */
export function VariableKindChoice({
  value,
  onChange,
}: {
  value: Kind;
  onChange: (kind: Kind) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {kinds.map((k) => (
        <button
          key={k.value}
          type="button"
          aria-pressed={value === k.value}
          onClick={() => onChange(k.value)}
          className={cn(
            'flex flex-col gap-1 rounded-lg border p-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50',
            value === k.value &&
              'border-primary bg-primary/5 hover:bg-primary/5',
          )}
        >
          <span className="text-sm font-medium">{k.title}</span>
          <span className="text-xs text-muted-foreground">{k.text}</span>
        </button>
      ))}
    </div>
  );
}
