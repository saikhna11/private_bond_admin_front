import type { ReactNode } from 'react';

/** A label and its value in a detail card; a missing value reads "-". */
export function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={mono ? 'tabular font-mono text-sm' : 'text-sm font-medium'}
      >
        {value || <span className="font-normal text-muted-foreground">-</span>}
      </dd>
    </div>
  );
}
