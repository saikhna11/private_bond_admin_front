import { LinkIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dismissCredit, linkCredit } from '@/queries/payment/query';
import { linkResultLabel } from '@/queries/payment/type';
import { CreditActionDialog } from './credit-action-dialog';

/** What the admin does with credit id nothing matched: link it to an order, or dismiss it. */
export function UnknownCreditActions({ id }: { id: string }) {
  return (
    <div className="flex justify-end gap-2">
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
    </div>
  );
}
