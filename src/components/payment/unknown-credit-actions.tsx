import { LinkIcon, Undo2Icon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import { PRIV } from '@/lib/rbac';
import {
  dismissCredit,
  linkCredit,
  returnCredit,
} from '@/queries/payment/query';
import { linkResultLabel } from '@/queries/payment/type';
import { CreditActionDialog } from './credit-action-dialog';

/** Whether the admin may act on a credit nothing matched at all. */
export function useCanResolveCredit(): boolean {
  const can = useCan();
  return (
    can(PRIV.paymentLink) || can(PRIV.paymentDismiss) || can(PRIV.paymentReturn)
  );
}

/**
 * What the admin does with credit id nothing matched, each as their privileges allow: link
 * it to an order, dismiss it, or note that the bank returned it by hand.
 */
export function UnknownCreditActions({ id }: { id: string }) {
  const can = useCan();
  return (
    <div className="flex justify-end gap-2">
      {can(PRIV.paymentLink) && (
        <CreditActionDialog
          trigger={
            <Button size="sm" variant="outline">
              <LinkIcon />
              Гэрээнд холбох
            </Button>
          }
          title="Гэрээнд холбох"
          description="Харилцагчийн захиалгын гүйлгээний утгыг оруулна. Захиалга төлбөр хүлээж байвал орлого түүнд тооцогдоно."
          label="Гүйлгээний утга"
          placeholder="PAY-MFG-7K3Q"
          action="Холбох"
          send={async (ref) =>
            linkResultLabel[(await linkCredit(id, ref)).status]
          }
        />
      )}
      {can(PRIV.paymentDismiss) && (
        <CreditActionDialog
          trigger={
            <Button size="sm" variant="ghost">
              <XIcon />
              Хамааралгүй
            </Button>
          }
          title="Хамааралгүй гэж тэмдэглэх"
          description="Энэ орлого ямар ч захиалгын төлбөр биш бол (бонд гаргагчийн эргэн төлөлт, банкны хүү гэх мэт) жагсаалтаас гаргана."
          label="Шалтгаан"
          placeholder="Жишээ нь: банкны хүүгийн орлого"
          action="Тэмдэглэх"
          multiline
          send={async (note) => {
            await dismissCredit(id, note);
            return 'Хамааралгүй гэж тэмдэглэлээ.';
          }}
        />
      )}
      {can(PRIV.paymentReturn) && (
        <CreditActionDialog
          trigger={
            <Button size="sm" variant="ghost">
              <Undo2Icon />
              Банкнаас буцаасан
            </Button>
          }
          title="Банкнаас гараар буцаасан"
          description="Систем зөвхөн баталгаажсан харилцагчийн данс руу шилжүүлдэг тул танигдаагүй төлөгчид санхүүгийн алба банкнаас гараар буцаана. Буцаасны дараа энд тэмдэглэнэ; тэмдэглэл нь бүртгэл болж үлдэнэ."
          label="Хэзээ, ямар гүйлгээгээр буцаасан"
          placeholder="Жишээ нь: 2026.11.06 Хаан банкнаас буцаасан, гүйлгээ #123456"
          action="Тэмдэглэх"
          multiline
          send={async (note) => {
            await returnCredit(id, note);
            return 'Банкнаас буцаасан гэж тэмдэглэлээ.';
          }}
        />
      )}
    </div>
  );
}
