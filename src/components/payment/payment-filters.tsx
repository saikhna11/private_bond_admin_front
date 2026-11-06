import {
  ClearFilters,
  DateFilter,
  FilterBar,
  SearchInput,
} from '@/components/common/list-parts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type PaymentCountsType,
  type PaymentFilter,
  type PaymentView,
  PaymentViewSchema,
  paymentViewLabel,
} from '@/queries/payment/type';

/** The day each list's dates count: when the money came in, or when the order was made. */
const dateLabel: Record<PaymentView, string> = {
  all: 'Огноо',
  unknown: 'Орсон өдөр',
  short: 'Захиалсан өдөр',
  refund: 'Захиалсан өдөр',
};

const searchHint: Record<PaymentView, string> = {
  all: 'Утга, данс, гэрээ, эзэмшигч',
  unknown: 'Гүйлгээний утга, данс',
  short: 'Гэрээ, утга, эзэмшигч',
  refund: 'Гэрээ, утга, эзэмшигч',
};

/** How many rows view holds: every list's together for all. */
function countOf(counts: PaymentCountsType, view: PaymentView): number {
  return view === 'all'
    ? counts.unknown + counts.short + counts.refund
    : counts[view];
}

/**
 * The payments page's filter bar, drawn as the other lists' (FilterBar): a search, then which
 * payments to look at, picked from a select with each list's count, and a range of days.
 * Clear drops the narrowing, not the list.
 */
export function PaymentFilters({
  tab,
  filter,
  counts,
  onTab,
  onFilter,
}: {
  tab: PaymentView;
  filter: PaymentFilter;
  counts?: PaymentCountsType;
  onTab: (tab: PaymentView) => void;
  onFilter: (patch: PaymentFilter) => void;
}) {
  const filtered = !!filter.from || !!filter.to || !!filter.q;
  return (
    <FilterBar
      search={
        <SearchInput
          value={filter.q ?? ''}
          onChange={(q) => onFilter({ q: q || undefined })}
          placeholder={searchHint[tab]}
        />
      }
    >
      <Select value={tab} onValueChange={(v) => onTab(v as PaymentView)}>
        <SelectTrigger aria-label="Төрөл" className="h-9! w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PaymentViewSchema.options.map((t) => (
            <SelectItem key={t} value={t}>
              {paymentViewLabel[t]}
              {counts && countOf(counts, t) > 0 && (
                <span className="tabular ml-1 rounded-full bg-primary/12 px-1.5 text-xs text-primary">
                  {countOf(counts, t)}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateFilter
        id="payments-from"
        label={`${dateLabel[tab]}: эхлэх`}
        value={filter.from}
        max={filter.to}
        onChange={(from) => onFilter({ from })}
      />
      <DateFilter
        id="payments-to"
        label={`${dateLabel[tab]}: дуусах`}
        value={filter.to}
        min={filter.from}
        onChange={(to) => onFilter({ to })}
      />
      {filtered && (
        <ClearFilters
          onClear={() =>
            onFilter({ from: undefined, to: undefined, q: undefined })
          }
        />
      )}
    </FilterBar>
  );
}
