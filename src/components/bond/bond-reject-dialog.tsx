import { Loader2Icon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { rejectBond } from '@/queries/bond/query';
import type { BondDetailType } from '@/queries/bond/type';
import { useBondAction } from './use-bond-action';

/** Turns down an issuer's request with a reason the issuer reads; the bond stays rejected. */
export function BondRejectDialog({ b }: { b: BondDetailType }) {
  const run = useBondAction();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const send = async () => {
    setPending(true);
    try {
      await run(() => rejectBond(b.id, reason.trim()), 'Хүсэлтийг татгалзлаа');
      setOpen(false);
    } catch {
      // useBondAction showed the error; the dialog stays open to fix the reason.
    } finally {
      setPending(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setReason('');
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive">
          <XCircleIcon />
          Татгалзах
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Хүсэлтийг татгалзах уу?</DialogTitle>
          <DialogDescription>
            Бонд гаргагч шалтгааныг харна. Татгалзсан хүсэлтийг дахин нийтлэх
            боломжгүй.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="bond-reject-reason">Шалтгаан</Label>
          <Textarea
            id="bond-reject-reason"
            maxLength={500}
            placeholder="Жишээ нь: хүүгийн нөхцөл тохирохгүй байна"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Болих</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={!reason.trim() || pending}
            onClick={() => void send()}
          >
            {pending && <Loader2Icon className="animate-spin" />}
            Татгалзах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
