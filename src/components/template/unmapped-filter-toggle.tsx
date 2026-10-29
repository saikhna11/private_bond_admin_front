import { FilterIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Narrows the mapping table to the placeholders left to map, or shows them all again. */
export function UnmappedFilterToggle({
  on,
  count,
  onToggle,
}: {
  on: boolean;
  /** How many placeholders are unmapped now. */
  count: number;
  onToggle: () => void;
}) {
  return (
    <Button variant={on ? 'secondary' : 'outline'} size="sm" onClick={onToggle}>
      {on ? <XIcon /> : <FilterIcon />}
      {on ? 'Бүгдийг харуулах' : `Зөвхөн холбоогүй (${count})`}
    </Button>
  );
}
