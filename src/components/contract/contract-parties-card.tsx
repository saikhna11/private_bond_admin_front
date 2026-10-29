import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type ContractPartyType,
  partyTypeLabel,
} from '@/queries/contract/type';
import { PartySignatureState } from './party-signature-state';

function nameOf(p: ContractPartyType) {
  return (
    p.organization_name ||
    [p.last_name, p.first_name].filter(Boolean).join(' ') ||
    '-'
  );
}

/** The people and organizations the contract names, and where each stands on signing. */
export function ContractPartiesCard({
  parties,
}: {
  parties: ContractPartyType[];
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle>Гэрээний талууд</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Үүрэг</TableHead>
            <TableHead>Нэр</TableHead>
            <TableHead>РД / Паспорт</TableHead>
            <TableHead>Утас</TableHead>
            <TableHead className="pr-4">Гарын үсэг</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="pl-4 text-muted-foreground">
                {partyTypeLabel[p.type]}
              </TableCell>
              <TableCell className="font-medium">{nameOf(p)}</TableCell>
              <TableCell className="font-mono text-sm tabular">
                {p.register_no}
              </TableCell>
              <TableCell className="tabular">{p.phone ?? '-'}</TableCell>
              <TableCell className="pr-4 text-sm">
                <PartySignatureState p={p} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
