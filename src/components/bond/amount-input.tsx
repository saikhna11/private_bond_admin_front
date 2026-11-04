import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';

/** A whole amount typed with thousands separators, kept as plain digits. */
export function AmountInput({
  value,
  onChange,
  ...props
}: Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value: string;
  onChange: (digits: string) => void;
}) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      className="tabular h-10"
      value={value ? BigInt(value).toLocaleString('en-US') : ''}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 26))}
    />
  );
}
