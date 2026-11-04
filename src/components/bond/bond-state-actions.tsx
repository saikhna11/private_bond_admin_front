import {
  CirclePauseIcon,
  CirclePlayIcon,
  CircleXIcon,
  EyeOffIcon,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { setBondState } from '@/queries/bond/query';
import type { BondDetailType } from '@/queries/bond/type';
import { BondPublishDialog } from './bond-publish-dialog';
import { useBondAction } from './use-bond-action';

/**
 * Moves a bond through its life: a draft is published, an active bond paused, a paused one
 * resumed, a published one hidden as a draft again while no contract names it, and any of
 * them closed for good.
 */
export function BondStateActions({ b }: { b: BondDetailType }) {
  const run = useBondAction();
  const state = b.manual_state;
  if (state === 'closed') return null;
  return (
    <>
      {state === 'draft' && <BondPublishDialog b={b} />}
      {state === 'active' && (
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
      {state === 'paused' && (
        <Button
          variant="outline"
          onClick={() =>
            void run(() => setBondState(b.id, 'active'), 'Борлуулалт сэргэлээ')
          }
        >
          <CirclePlayIcon />
          Сэргээх
        </Button>
      )}
      {state !== 'draft' && (
        <ConfirmDialog
          trigger={
            <Button variant="outline">
              <EyeOffIcon />
              Ноорог болгох
            </Button>
          }
          title="Бондыг ноорог болгох уу?"
          description="Харилцагчид харагдахаа больж, дахин нийтлэх хүртэл худалдаалагдахгүй. Гэрээтэй бондыг ноорог болгох боломжгүй."
          confirmLabel="Ноорог болгох"
          tone="default"
          onConfirm={() =>
            run(() => setBondState(b.id, 'draft'), 'Бонд ноорог боллоо')
          }
        />
      )}
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="text-destructive">
            <CircleXIcon />
            Хаах
          </Button>
        }
        title="Бондыг хаах уу?"
        description={
          state === 'draft'
            ? 'Ноорог бонд нийтлэгдэлгүй хаагдана. Хаасан бондыг буцааж нээх боломжгүй.'
            : 'Хаасан бонд дахин худалдаалагдахгүй, буцааж нээх боломжгүй. Эзэмшигчид худалдан авалтаа харсаар байна.'
        }
        confirmLabel="Хаах"
        onConfirm={() =>
          run(() => setBondState(b.id, 'closed'), 'Бонд хаагдлаа')
        }
      />
    </>
  );
}
