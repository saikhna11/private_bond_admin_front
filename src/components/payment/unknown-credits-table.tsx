import { useQuery } from '@tanstack/react-query';
import { LinkIcon, Undo2Icon, XIcon } from 'lucide-react';
import {
  Pagination,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCan } from '@/hooks/use-can';
import { formatDate, formatMoney } from '@/lib/format';
import { PRIV } from '@/lib/rbac';
import { PAGE_SIZE } from '@/lib/types';
import { unknownCreditsOptions } from '@/queries/payment/options';
import {
  dismissCredit,
  linkCredit,
  returnCredit,
} from '@/queries/payment/query';
import { linkResultLabel } from '@/queries/payment/type';
import { CreditActionDialog } from './credit-action-dialog';

/**
 * The statement credits no order's reference matched: the admin links one to the order the
 * payer meant, or dismisses one that pays no order.
 */
export function UnknownCreditsTable({
  page,
  onPage,
}: {
  page: number;
  onPage: (page: number) => void;
}) {
  const { data, isPending, isPlaceholderData } = useQuery(
    unknownCreditsOptions(page),
  );
  const can = useCan();
  const canLink = can(PRIV.paymentLink);
  const canDismiss = can(PRIV.paymentDismiss);
  const canReturn = can(PRIV.paymentReturn);
  const resolve = canLink || canDismiss || canReturn;
  const cols = resolve ? 5 : 4;
  return (
    <>
      <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Огноо</TableHead>
            <TableHead>Гүйлгээний утга</TableHead>
            <TableHead>Илгээсэн данс</TableHead>
            <TableHead className="text-right">Дүн</TableHead>
            {resolve && <TableHead className="text-right">Үйлдэл</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows cols={cols} />
          ) : !data?.items.length ? (
            <TableEmpty cols={cols} title="Танигдаагүй орлого алга" />
          ) : (
            data.items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="tabular whitespace-nowrap">
                  {formatDate(c.tran_date)} {c.tran_time}
                </TableCell>
                <TableCell className="max-w-72 [overflow-wrap:anywhere]">
                  {c.description || '-'}
                </TableCell>
                <TableCell className="tabular">
                  {c.related_account || '-'}
                </TableCell>
                <TableCell className="tabular text-right font-medium text-success">
                  {formatMoney(c.amount, c.currency)}
                </TableCell>
                {resolve && (
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {canLink && (
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
                            linkResultLabel[
                              (await linkCredit(c.id, ref)).status
                            ]
                          }
                        />
                      )}
                      {canDismiss && (
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
                            await dismissCredit(c.id, note);
                            return 'Хамааралгүй гэж тэмдэглэлээ.';
                          }}
                        />
                      )}
                      {canReturn && (
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
                            await returnCredit(c.id, note);
                            return 'Банкнаас буцаасан гэж тэмдэглэлээ.';
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data && data.total > 0 && (
        <Pagination
          page={page}
          size={PAGE_SIZE}
          total={data.total}
          onPage={onPage}
        />
      )}
    </>
  );
}
