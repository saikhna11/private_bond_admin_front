import { useCallback, useEffect, useRef, useState } from 'react';

const highlightMs = 1500;

/** The id of a placeholder's row in the mapping table. */
export const fieldRowId = (placeholder: string) => `field-${placeholder}`;

/**
 * Brings a placeholder's row into view in the mapping table and highlights it for a moment:
 * the problems list sends the admin to what is left to map.
 */
export function useRowFocus() {
  const [focused, setFocused] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const focus = useCallback((placeholder: string) => {
    document
      .getElementById(fieldRowId(placeholder))
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setFocused(placeholder);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFocused(null), highlightMs);
  }, []);

  return { focused, focus };
}

export type RowFocus = ReturnType<typeof useRowFocus>;
