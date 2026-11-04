import { CirclePauseIcon, CirclePlayIcon, CircleXIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { setBondState } from '@/queries/bond/query';
import type { BondDetailType } from '@/queries/bond/type';
import { useBondAction } from './use-bond-action';

/** Pauses, resumes or closes a bond's sales; a closed bond stays closed. */
export function BondStateActions({ b }: { b: BondDetailType }) {
  const run = useBondAction();
  if (b.manual_state === 'closed') return null;
  return (
    <>
      {b.manual_state === 'paused' ? (
        <Button
          variant="outline"
          onClick={() =>
            void run(() => setBondState(b.id, 'none'), 'Борлуулалт сэргэлээ')
          }
        >
          <CirclePlayIcon />
          Сэргээх
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() =>
            void run(
              () => setBondState(b.id, 'paused'),
              'Борлуулалт түр зогслоо',
            )
          }
        >
          <CirclePauseIcon />
          Түр зогсоох
        </Button>
      )}
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="text-destructive">
            <CircleXIcon />
            Хаах
          </Button>
        }
        title="Бондыг хаах уу?"
        description="Хаасан бонд дахин худалдаалагдахгүй, буцааж нээх боломжгүй. Эзэмшигчид худалдан авалтаа харсаар байна."
        confirmLabel="Хаах"
        onConfirm={() =>
          run(() => setBondState(b.id, 'closed'), 'Бонд хаагдлаа')
        }
      />
    </>
  );
}
