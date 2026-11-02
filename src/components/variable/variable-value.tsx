import { useQuery } from '@tanstack/react-query';
import { variableFieldsOptions } from '@/queries/variable/options';
import { type AdminVariableType, describeField } from '@/queries/variable/type';

/**
 * What a variable prints: that the system computes a system one from the contract, what a
 * field one reads and in which format, or a custom one's Mongolian and English texts.
 */
export function VariableValue({
  variable: v,
}: {
  variable: AdminVariableType;
}) {
  const { data: catalog } = useQuery(variableFieldsOptions());
  if (v.kind === 'system') {
    return (
      <span className="text-sm text-muted-foreground">Гэрээнээс бодогдоно</span>
    );
  }
  if (v.kind === 'field') {
    return (
      <p className="max-w-80 truncate text-sm">{describeField(catalog, v)}</p>
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
