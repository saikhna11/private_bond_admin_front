import { useState } from 'react';

// The chips shown before the rest are asked for.
const shown = 12;

/** The placeholders left to map, each a link to its row in the mapping table. */
export function ProblemPlaceholderChips({
  placeholders,
  onFocus,
}: {
  placeholders: string[];
  onFocus: (placeholder: string) => void;
}) {
  const [all, setAll] = useState(false);
  const visible = all ? placeholders : placeholders.slice(0, shown);
  const hidden = placeholders.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onFocus(p)}
          className="rounded-md border border-warning/40 bg-background px-1.5 py-0.5 font-mono text-xs text-foreground transition-colors hover:border-warning hover:bg-warning/10"
        >
          {`{${p}}`}
        </button>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="px-1.5 py-0.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          +{hidden} бусад
        </button>
      )}
    </div>
  );
}
