import type { ComponentProps } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

/** "4 нэгж" for an amount that is a whole number of units, else nothing. */
function unitsOf(amount: string, unit: string): string | undefined {
  if (!/^\d+$/.test(amount) || amount === '0') return undefined;
  const a = BigInt(amount);
  const u = BigInt(unit);
  return a % u === 0n ? `${(a / u).toLocaleString('en-US')} нэгж` : undefined;
}

/**
 * A whole amount typed with thousands separators, kept as plain digits. Its end shows how many
 * purchase units it makes and the currency.
 */
export function AmountInput({
  value,
  onChange,
  unit,
  currency,
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, 'value' | 'onChange'> & {
  value: string;
  onChange: (digits: string) => void;
  unit: string | null;
  currency: string;
}) {
  const units = unitsOf(value, unit ?? '1');
  return (
    <InputGroup className="h-10">
      <InputGroupInput
        {...props}
        inputMode="numeric"
        className="tabular"
        value={value ? BigInt(value).toLocaleString('en-US') : ''}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, '').slice(0, 26))
        }
      />
      <InputGroupAddon align="inline-end" className="tabular font-normal">
        {units && <span>{units} ·</span>}
        <span>{currency === 'MNT' ? '₮' : '$'}</span>
      </InputGroupAddon>
    </InputGroup>
  );
}
