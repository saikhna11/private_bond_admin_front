import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toApiError } from '@/lib/fetcher';
import { formatMoney } from '@/lib/format';
import { showToast } from '@/lib/utils';
import { scheduleKeys } from '@/queries/schedule/options';
import { editScheduleRow } from '@/queries/schedule/query';
import type { ScheduleRowType } from '@/queries/schedule/type';

/**
 * Edits an unpaid schedule row (bond.md 9.4): its pay date, interest before and after tax and
 * principal, with a reason the audit log keeps. Only that row changes; a later recalculation
 * leaves it as it is.
 */
export function EditScheduleRowDialog({
  contractId,
  currency,
  row,
  trigger,
}: {
  contractId: string;
  currency: string;
  row: ScheduleRowType;
  trigger: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [payDate, setPayDate] = useState(row.pay_date);
  const [gross, setGross] = useState(row.gross_interest);
  const [net, setNet] = useState(row.net_interest);
  const [principal, setPrincipal] = useState(row.principal);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const n = (v: string) => (v.trim() === '' ? Number.NaN : Number(v));
  const tax = n(gross) - n(net);
  const total = n(net) + n(principal);
  const valid =
    !!payDate &&
    [n(gross), n(net), n(principal)].every(
      (v) => Number.isFinite(v) && v >= 0,
    ) &&
    n(net) <= n(gross) &&
    reason.trim().length > 0;

  async function save() {
    setError('');
    setSaving(true);
    try {
      await editScheduleRow(contractId, row.no, {
        pay_date: payDate,
        gross_interest: gross.trim(),
        net_interest: net.trim(),
        principal: principal.trim(),
        reason: reason.trim(),
      });
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      showToast('success', `${row.no}-р мөрийг заслаа.`);
      setOpen(false);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setPayDate(row.pay_date);
          setGross(row.gross_interest);
          setNet(row.net_interest);
          setPrincipal(row.principal);
          setReason('');
          setError('');
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{row.no}-р мөр засах</DialogTitle>
          <DialogDescription>
            Зөвхөн энэ мөр өөрчлөгдөнө: дараагийн мөрийн хоног, хүү хэвээр.
            Баярын өдөр нэмэгдэх, татварын хувь өөрчлөгдөхөд засагдсан мөрийг
            систем дахин тооцохгүй.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="pay_date" label="Төлөх өдөр">
            <Input
              id="pay_date"
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
            />
          </FormField>
          <FormField id="principal" label={`Үндсэн төлбөр (${currency})`}>
            <Input
              id="principal"
              inputMode="decimal"
              className="tabular"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
          </FormField>
          <FormField id="gross" label={`Татварын өмнөх хүү (${currency})`}>
            <Input
              id="gross"
              inputMode="decimal"
              className="tabular"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
            />
          </FormField>
          <FormField id="net" label={`Харилцагч авах хүү (${currency})`}>
            <Input
              id="net"
              inputMode="decimal"
              className="tabular"
              value={net}
              onChange={(e) => setNet(e.target.value)}
            />
          </FormField>
        </div>
        <p className="text-sm text-muted-foreground">
          Татвар:{' '}
          <span className="tabular">
            {Number.isFinite(tax) ? formatMoney(tax, currency) : '-'}
          </span>{' '}
          · Нийт авах:{' '}
          <span className="tabular font-medium text-foreground">
            {Number.isFinite(total) ? formatMoney(total, currency) : '-'}
          </span>
        </p>
        <FormField id="reason" label="Засах шалтгаан">
          <Textarea
            id="reason"
            maxLength={500}
            placeholder="Жишээ нь: бонд гаргагчийн хүсэлтээр төлөх өдрийг хойшлуулсан"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Болих</Button>
          </DialogClose>
          <Button disabled={!valid || saving} onClick={() => void save()}>
            {saving && <Loader2Icon className="animate-spin" />}
            Хадгалах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
