import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type InterestMethod,
  InterestMethodSchema,
  interestMethodHint,
  interestMethodLabel,
} from "@/queries/bond/type";

/** The ways interest is counted, each a card that says what it does. */
export function InterestMethodCards({
  value,
  onChange,
}: {
  value: InterestMethod;
  onChange: (method: InterestMethod) => void;
}) {
  return (
    <RadioGroup
      aria-label="Хүү тооцох арга"
      value={value}
      onValueChange={(v) => onChange(v as InterestMethod)}
      className="grid gap-3 @md/field-group:grid-cols-2"
    >
      {InterestMethodSchema.options.map((m) => (
        <FieldLabel
          key={m}
          htmlFor={`interest_method_${m}`}
          className="cursor-pointer has-data-[state=checked]:border-primary/60 has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10"
        >
          <Field orientation="horizontal">
            <RadioGroupItem value={m} id={`interest_method_${m}`} />
            <FieldContent>
              <FieldTitle>{interestMethodLabel[m]}</FieldTitle>
              <FieldDescription>{interestMethodHint[m]}</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  );
}
