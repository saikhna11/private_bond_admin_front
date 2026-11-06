import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import {
  type ContractPartyType,
  partyTypeLabel,
  type UnderwriterType,
} from '@/queries/contract/type';
import { PartySignatureState } from './party-signature-state';

/** A party's name; the issuer's with its director, who signs for it. */
function nameOf(p: ContractPartyType) {
  const person = [p.last_name, p.first_name].filter(Boolean).join(' ');
  if (p.type === 'issuer' && p.organization_name) {
    return person ? `${p.organization_name} · ${person}` : p.organization_name;
  }
  return (
    p.organization_name ||
    [p.last_name, p.first_name].filter(Boolean).join(' ') ||
    '-'
  );
}

/**
 * The people and organizations the contract names, and where each stands on signing, then
 * the underwriter, which it names beside them and whose signature it holds from the start,
 * dated when the contract was made (createdAt).
 */
export function ContractPartiesCard({
  parties,
  underwriter,
  createdAt,
}: {
  parties: ContractPartyType[];
  underwriter: UnderwriterType;
  createdAt: string;
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
            <TableHead>Гарын үсэг</TableHead>
            <TableHead className="pr-4">Огноо</TableHead>
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
              <TableCell className="text-sm">
                <PartySignatureState p={p} />
              </TableCell>
              <TableCell className="pr-4 text-sm text-muted-foreground tabular">
                {formatDateTime(p.signed_at ?? p.declined_at) || '-'}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="pl-4 text-muted-foreground">
              Андеррайтер
            </TableCell>
            <TableCell className="font-medium">
              {underwriter.name} · {underwriter.director_last_name}{' '}
              {underwriter.director_first_name}
            </TableCell>
            <TableCell className="font-mono text-sm tabular">
              {underwriter.register_no}
            </TableCell>
            <TableCell className="tabular">{underwriter.phone}</TableCell>
            <TableCell className="text-sm">
              <span className="font-medium text-success">Зурсан</span>
            </TableCell>
            <TableCell className="pr-4 text-sm text-muted-foreground tabular">
              {formatDateTime(createdAt) || '-'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
