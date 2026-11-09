import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { TriangleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { BondDetailType } from '@/queries/bond/type';
import { templatesOptions } from '@/queries/template/options';

/**
 * Warns, as a template's own problems do, while no active contract template names the bond:
 * a draft cannot be published, and a published bond sells to no one.
 */
export function BondTemplateWarning({ b }: { b: BondDetailType }) {
  const { data, isPending } = useQuery(
    templatesOptions({ status: 'active', bond_id: b.id }),
  );
  if (isPending || (data?.total ?? 0) > 0 || b.manual_state === 'rejected') {
    return null;
  }
  return (
    <Alert className="border-warning/40 bg-warning/5">
      <TriangleAlertIcon className="text-warning-foreground dark:text-warning" />
      <AlertTitle className="mb-1">Гэрээний загвар холбогдоогүй</AlertTitle>
      <AlertDescription>
        <span>
          {b.manual_state === 'draft'
            ? 'Идэвхтэй гэрээний загваргүй бондыг нийтлэх боломжгүй. '
            : 'Идэвхтэй гэрээний загваргүй тул харилцагч энэ бондыг худалдан авах боломжгүй. '}
          <Link
            to="/templates"
            search={{ bond_id: b.id }}
            className="font-medium underline underline-offset-4"
          >
            Гэрээний загвар
          </Link>{' '}
          хуудаснаас энэ бондод загвар оруулж идэвхжүүлнэ үү.
        </span>
      </AlertDescription>
    </Alert>
  );
}
