import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { cn } from '@/lib/utils';
import {
  type CustomVariableBody,
  type CustomVariableType,
  customPrefix,
} from '@/queries/variable/type';

const schema = z.object({
  key: z
    .string()
    .trim()
    .max(57)
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
      'Жижиг латин үсэг, тоо, _ ашиглана; хэсгүүдийг цэгээр холбоно (issuer_name)',
    ),
  label: z.string().trim().min(1, 'Нэрээ оруулна уу').max(100),
  group: z.string().trim().max(50),
  value_mn: z.string().max(1000),
  value_en: z.string().max(1000),
});
type Values = z.infer<typeof schema>;

/**
 * Creates an admin's variable, or changes one: all but its key, which templates map it by.
 */
export function VariableFormDialog({
  variable,
  trigger,
  onSubmit,
}: {
  /** The variable to change; left out to create one. */
  variable?: CustomVariableType;
  trigger: ReactNode;
  onSubmit: (body: CustomVariableBody) => Promise<unknown>;
}) {
  const editing = !!variable;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const defaults = (): Values => ({
    key: variable ? variable.key.slice(customPrefix.length) : '',
    label: variable?.label ?? '',
    group: variable?.group ?? '',
    value_mn: variable?.value_mn ?? '',
    value_en: variable?.value_en ?? '',
  });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(v: Values) {
    setError(null);
    try {
      await onSubmit({
        key: editing ? undefined : v.key,
        label: v.label,
        group: v.group || undefined,
        value_mn: v.value_mn,
        value_en: v.value_en || undefined,
      });
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'contract.variable_key_taken') {
        form.setError('key', { message: e.message });
        return;
      }
      if (
        applyFieldErrors(e, form.setError, {
          key: 'key',
          label: 'label',
          group: 'group',
          value_mn: 'value_mn',
          value_en: 'value_en',
        })
      ) {
        return;
      }
      setError(e);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          form.reset(defaults());
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Хувьсагч засах' : 'Шинэ хувьсагч'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Шинэ утга дараагийн гэрээнээс хэвлэгдэнэ. Үүссэн гэрээ хуучин утгаа хадгална.'
                : 'Загварын хоосон зайг энэ хувьсагчтай холбоход утга нь гэрээнд хэвлэгдэнэ.'}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <FormField
              id="key"
              label="Түлхүүр"
              error={errors.key?.message}
              hint={editing ? 'Түлхүүр өөрчлөгдөхгүй.' : undefined}
            >
              <InputGroup className="h-10">
                <InputGroupAddon>
                  <InputGroupText className="font-mono">
                    {customPrefix}
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="key"
                  autoComplete="off"
                  className={cn(
                    'font-mono',
                    editing && 'text-muted-foreground',
                  )}
                  placeholder="issuer_name"
                  readOnly={editing}
                  // Read only when editing: the dialog focuses the name instead.
                  tabIndex={editing ? -1 : undefined}
                  aria-invalid={!!errors.key}
                  {...form.register('key')}
                />
              </InputGroup>
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="label" label="Нэр" error={errors.label?.message}>
                <Input
                  id="label"
                  className="h-10"
                  placeholder="Гаргагчийн нэр"
                  aria-invalid={!!errors.label}
                  {...form.register('label')}
                />
              </FormField>
              <FormField
                id="group"
                label="Бүлэг"
                optional
                error={errors.group?.message}
              >
                <Input
                  id="group"
                  className="h-10"
                  placeholder="Гаргагч"
                  aria-invalid={!!errors.group}
                  {...form.register('group')}
                />
              </FormField>
            </div>
            <FormField
              id="value_mn"
              label="Монгол утга"
              error={errors.value_mn?.message}
            >
              <Input
                id="value_mn"
                className="h-10"
                aria-invalid={!!errors.value_mn}
                {...form.register('value_mn')}
              />
            </FormField>
            <FormField
              id="value_en"
              label="Англи утга"
              optional
              error={errors.value_en?.message}
              hint="Хоосон бол англи загварт монгол утга хэвлэгдэнэ."
            >
              <Input
                id="value_en"
                className="h-10"
                aria-invalid={!!errors.value_en}
                {...form.register('value_en')}
              />
            </FormField>
          </FieldGroup>
          <ApiErrorAlert error={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Болих
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {editing ? 'Хадгалах' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
