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
