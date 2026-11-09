import { ChevronDownIcon, SlidersHorizontalIcon } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * A list's filters behind a "Шүүлтүүр" button that slides them down. `active` counts the
 * filters set; the panel starts open when any is. `leading` stays beside the button.
 */
export function FilterPanel({
  active,
  onClear,
  leading,
  children,
}: {
  active: number;
  onClear: () => void;
  leading?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(active > 0);
  const panelId = useId();
  return (
    <div className="border-b">
      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        {leading}
        <Button
          variant="outline"
          className="h-9"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <SlidersHorizontalIcon />
          Шүүлтүүр
          {active > 0 && (
            <span className="tabular rounded-full bg-primary px-1.5 text-[11px] leading-4 font-medium text-primary-foreground">
              {active}
            </span>
          )}
          <ChevronDownIcon
            className={cn('transition-transform', open && 'rotate-180')}
          />
        </Button>
        {active > 0 && (
          <Button variant="ghost" className="h-9" onClick={onClear}>
            Шүүлтүүр цэвэрлэх
          </Button>
        )}
      </div>
      <div
        id={panelId}
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:flex-wrap sm:items-end">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
