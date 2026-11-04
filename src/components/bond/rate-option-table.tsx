import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  addRateOption,
  deleteRateOption,
  updateRateOption,
} from '@/queries/bond/query';
import {
  type BondDetailType,
  frequencyLabel,
  termLabel,
} from '@/queries/bond/type';
import { RateOptionFormDialog } from './rate-option-form-dialog';
import { useBondAction } from './use-bond-action';

/**
 * A bond's rate matrix: one option is simple, several a matrix (bond.md 4). An option a
 * contract was bought on cannot be changed: it is deleted and another added.
 */
export function RateOptionTable({ b }: { b: BondDetailType }) {
  const run = useBondAction();
  const last = b.rate_options.length === 1;
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>Хүүгийн нөхцөл</CardTitle>
        <CardDescription>
          {last
            ? 'Энгийн: нэг нөхцөл'
            : `Матриц: ${b.rate_options.length} нөхцөл`}
        </CardDescription>
        <CardAction>
          <RateOptionFormDialog
            trigger={
              <Button variant="outline" size="sm">
                <PlusIcon />
                Нөхцөл нэмэх
              </Button>
            }
            onSubmit={(body) =>
              run(() => addRateOption(b.id, body), 'Нөхцөл нэмэгдлээ')
            }
          />
        </CardAction>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Хугацаа</TableHead>
            <TableHead>Хүү төлөх давтамж</TableHead>
            <TableHead className="text-right">Жилийн хүү</TableHead>
            <TableHead className="w-24 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {b.rate_options.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="tabular pl-4">{termLabel(o)}</TableCell>
              <TableCell>{frequencyLabel[o.interest_frequency]}</TableCell>
              <TableCell className="tabular text-right">
                {Number(o.annual_rate).toFixed(2)}%
              </TableCell>
              <TableCell className="pr-4 text-right">
                <RateOptionFormDialog
                  option={o}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Засах">
                      <PencilIcon />
                    </Button>
                  }
                  onSubmit={(body) =>
                    run(
                      () => updateRateOption(b.id, o.id, body),
                      'Нөхцөл хадгалагдлаа',
                    )
                  }
                />
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Устгах"
                      disabled={last}
                    >
                      <Trash2Icon />
                    </Button>
                  }
                  title="Нөхцлийг устгах уу?"
                  description={`${termLabel(o)}, ${frequencyLabel[o.interest_frequency]}, ${Number(o.annual_rate).toFixed(2)}%. Шинэ худалдан авалтад санал болгохоо болино; энэ нөхцлөөр авсан гэрээ хэвээр.`}
                  confirmLabel="Устгах"
                  onConfirm={() =>
                    run(() => deleteRateOption(b.id, o.id), 'Нөхцөл устлаа')
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
