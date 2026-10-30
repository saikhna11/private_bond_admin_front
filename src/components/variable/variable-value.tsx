import type { AdminVariableType } from '@/queries/variable/type';

/**
 * What a variable prints: a custom one's Mongolian and English texts, or that the system
 * computes a system one from the contract.
 */
export function VariableValue({
  variable: v,
}: {
  variable: AdminVariableType;
}) {
  if (v.kind === 'system') {
    return (
      <span className="text-sm text-muted-foreground">Гэрээнээс бодогдоно</span>
    );
  }
  return (
    <div className="max-w-80 text-sm">
      <p className="truncate" title={v.value_mn}>
        {v.value_mn || <span className="text-muted-foreground">(хоосон)</span>}
      </p>
      <p className="truncate text-xs text-muted-foreground" title={v.value_en}>
        EN: {v.value_en || 'монгол утгаар'}
      </p>
    </div>
  );
}
