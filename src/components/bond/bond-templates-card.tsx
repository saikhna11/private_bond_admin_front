import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronRightIcon, FileTextIcon } from 'lucide-react';
import { TemplateStatusBadge } from '@/components/template/template-status-badge';
import { TtdBadge } from '@/components/template/ttd-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BondDetailType } from '@/queries/bond/type';
import { templatesOptions } from '@/queries/template/options';
import { languageLabel, ownershipLabel } from '@/queries/template/type';

/** The contract templates that name a bond; a row opens its template. */
export function BondTemplatesCard({ b }: { b: BondDetailType }) {
  const navigate = useNavigate();
  const { data, isPending } = useQuery(templatesOptions({ bond_id: b.id }));
  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Гэрээний загвар</CardTitle>
        <CardDescription>
          Харилцагч идэвхтэй загвараар нь гэрээ байгуулна
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link to="/templates" search={{ bond_id: b.id }}>
              Бүгдийг харах
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-16 w-full" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Энэ бондод холбогдсон гэрээний загвар алга.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {items.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                  onClick={() =>
                    void navigate({
                      to: '/templates/$templateId',
                      params: { templateId: t.id },
                    })
                  }
                >
                  <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {ownershipLabel[t.ownership_type]} ·{' '}
                      {languageLabel[t.language]}
                    </span>
                  </span>
                  {t.ttd && <TtdBadge />}
                  <TemplateStatusBadge status={t.status} />
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
