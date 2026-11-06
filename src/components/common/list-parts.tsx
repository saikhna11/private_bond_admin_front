import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

/** A search box that reports after the user stops typing. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text);

  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (debounced.trim() !== value) onChange(debounced.trim());
  }, [debounced, value, onChange]);

  return (
    <div className="relative w-full sm:w-72">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-9 pr-8 pl-9"
        aria-label={placeholder}
      />
      {text && (
        <button
          type="button"
          onClick={() => setText('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Цэвэрлэх"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * A list's filter row, drawn as the contracts page draws it: the search at the left and the
 * other filters at the right, one row from sm up. Without a search the filters start at the
 * left.
 */
export function FilterBar({
  search,
  children,
}: {
  search?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
      {search}
      {children && (
        <div
          className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${search ? 'sm:ml-auto sm:justify-end' : ''}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** A day filter sized as the selects; label names it to screen readers and on hover. */
export function DateFilter({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value?: string;
  min?: string;
  max?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Input
      id={id}
      type="date"
      aria-label={label}
      title={label}
      value={value ?? ''}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="h-9 w-full sm:w-40"
    />
  );
}

/** The first and the last day a list's rows were made; either may be left empty. */
export function DayRangeFilter({
  id,
  from,
  to,
  onChange,
}: {
  id: string;
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
}) {
  return (
    <>
      <DateFilter
        id={`${id}-from`}
        label="Эхлэх өдөр"
        value={from}
        max={to}
        onChange={(v) => onChange({ from: v, to })}
      />
      <DateFilter
        id={`${id}-to`}
        label="Дуусах өдөр"
        value={to}
        min={from}
        onChange={(v) => onChange({ from, to: v })}
      />
    </>
  );
}

/** Clears a list's filters; shown only while one is set. */
export function ClearFilters({ onClear }: { onClear: () => void }) {
  return (
    <Button variant="ghost" className="h-9" onClick={onClear}>
      Шүүлтүүр цэвэрлэх
    </Button>
  );
}

const ALL = '__all';

/** A filter select whose first option clears it. */
export function FilterSelect<T extends string>({
  value,
  onChange,
  allLabel,
  options,
}: {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  allLabel: string;
  options: { value: T; label: string }[];
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(v) => onChange(v === ALL ? undefined : (v as T))}
    >
      <SelectTrigger className="h-9! w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Pagination({
  page,
  size,
  total,
  onPage,
}: {
  page: number;
  size: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t px-4 py-3 text-sm">
      <p className="tabular text-muted-foreground">
        {from}-{to} / нийт {total}
      </p>
      <div className="flex items-center gap-2">
        <span className="tabular hidden text-muted-foreground sm:inline">
          {page} / {pages} хуудас
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Өмнөх хуудас"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Дараах хуудас"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}

export function TableSkeletonRows({
  cols,
  rows = 6,
}: {
  cols: number;
  rows?: number;
}) {
  return Array.from({ length: rows }, (_, r) => (
    <TableRow key={r} className="hover:bg-transparent">
      {Array.from({ length: cols }, (_, c) => (
        <TableCell key={c} className="py-3.5">
          <Skeleton className="h-4 w-full max-w-40" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function TableEmpty({
  cols,
  title,
  text,
}: {
  cols: number;
  title: string;
  text?: ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={cols} className="py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <InboxIcon className="size-5" />
          </span>
          <p className="font-medium">{title}</p>
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </TableCell>
    </TableRow>
  );
}
