import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAmount, formatDate } from '@/lib/format';
import {
  type AdminContractDetailType,
  interestFrequencyLabel,
} from '@/queries/contract/type';
import { InfoItem } from './info-item';

/** The contract's terms, as copied from the bond when it was drafted, and its repayment account. */
export function ContractTermsCard({ c }: { c: AdminContractDetailType }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Гэрээний нөхцөл</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
            <InfoItem
              label="Үндсэн дүн"
              value={formatAmount(c.principal_amount, c.currency)}
            />
            <InfoItem label="Жилийн хүү" value={`${c.annual_rate}%`} />
            <InfoItem label="Татвар" value={`${c.tax_rate}%`} />
            <InfoItem label="Хугацаа" value={`${c.term_months} сар`} />
            <InfoItem
              label="Хүү төлөх давтамж"
              value={interestFrequencyLabel[c.interest_frequency]}
            />
            <InfoItem
              label="Гэрээний огноо"
              value={formatDate(c.contract_date)}
            />
            <InfoItem label="Эхлэх огноо" value={formatDate(c.start_date)} />
            <InfoItem
              label="Дуусах огноо"
              value={formatDate(c.maturity_date)}
            />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Эргэн төлөлтийн данс</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <InfoItem label="Банк" value={c.repayment_bank_name} />
            <InfoItem
              label="Дансны дугаар"
              value={c.repayment_account_no}
              mono
            />
            <InfoItem label="IBAN" value={c.repayment_iban} mono />
            <InfoItem label="Данс эзэмшигч" value={c.repayment_owner} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
