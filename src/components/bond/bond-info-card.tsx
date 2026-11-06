import { Card, CardContent } from '@/components/ui/card';
import { formatAmount, formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type BondDetailType, interestMethodLabel } from '@/queries/bond/type';
import { BondEditDialog } from './bond-edit-dialog';
import { BondSalesStatusBadge } from './bond-sales-status-badge';
import { BondStateActions } from './bond-state-actions';

function Term({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-0.5">
      <dt className="truncate text-sm text-muted-foreground" title={label}>
        {label}
      </dt>
      <dd
        className={cn(
          'tabular truncate text-sm',
          emphasis ? 'font-semibold' : 'font-medium',
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function TermGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 @sm:grid-cols-2 @2xl:grid-cols-3">
        {children}
      </dl>
    </section>
  );
}

/** A bond's name, sales status and terms, with its actions. */
export function BondInfoCard({ b }: { b: BondDetailType }) {
  const amount = (v: string) => formatAmount(v, b.currency);
  return (
    <Card className="py-0">
      <CardContent className="@container space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-medium">
                {b.code}
              </span>
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {b.name}
              </h1>
              <BondSalesStatusBadge status={b.sales_status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {b.bond_issuer_name} · бүртгэсэн {formatDateTime(b.created_at)}
              {b.updated_at && ` · засварласан ${formatDateTime(b.updated_at)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BondStateActions b={b} />
            <BondEditDialog b={b} />
          </div>
        </div>

        <div className="space-y-6 border-t pt-6">
          <TermGroup title="Дүн ба үнэ">
            <Term
              label="Нийт босгох дүн"
              value={amount(b.total_amount)}
              emphasis
            />
            <Term label="Нэгж үнэ" value={amount(b.purchase_unit)} emphasis />
            <Term
              label="Хамгийн бага худалдан авалт"
              value={amount(b.min_purchase)}
            />
            <Term
              label="Хамгийн их худалдан авалт"
              value={b.investor_cap ? amount(b.investor_cap) : 'Хязгааргүй'}
            />
          </TermGroup>

          <TermGroup title="Борлуулалт">
            <Term label="Эхлэх огноо" value={formatDate(b.sale_start)} />
            <Term
              label="Дуусах огноо"
              value={b.sale_end ? formatDate(b.sale_end) : 'Хугацаагүй'}
            />
            <Term label="Хүү эргэн төлөх цаг" value={b.issuer_cutoff} />
          </TermGroup>

          <TermGroup title="Хүү, шимтгэл, нөхцөл">
            <Term
              label="Хүү тооцох арга"
              value={interestMethodLabel[b.interest_method]}
            />
            <Term
              label="Хугацаанаас өмнө гарах шимтгэл"
              value={`${b.exit_fee_rate}%`}
            />
            <Term label="Алданги, хоногт" value={`${b.penalty_rate}%`} />
            <Term
              label="Батлан даалт, барьцаа"
              value={b.has_guarantee ? 'Тийм' : 'Үгүй'}
            />
          </TermGroup>
        </div>

        {b.prospectus && (
          <div className="space-y-1 border-t pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Танилцуулга
            </p>
            <p className="whitespace-pre-line text-sm">{b.prospectus}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
