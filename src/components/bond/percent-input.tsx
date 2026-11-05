import type { ComponentProps } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

/** A rate typed as a decimal, with its percent sign. */
export function PercentInput(props: ComponentProps<typeof InputGroupInput>) {
  return (
    <InputGroup className="h-10">
      <InputGroupInput {...props} inputMode="decimal" className="tabular" />
      <InputGroupAddon align="inline-end">%</InputGroupAddon>
    </InputGroup>
  );
}
