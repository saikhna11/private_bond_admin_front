import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { variableFieldsOptions } from '@/queries/variable/options';
import {
  type AdminVariableType,
  describeField,
  type VariableBody,
  VariableKindSchema,
} from '@/queries/variable/type';
import { VariableFieldPicker } from './variable-field-picker';
import { VariableKindChoice } from './variable-kind-choice';

const schema = z
  .object({
    kind: VariableKindSchema,
    label: z.string().trim().min(1, 'Нэрээ оруулна уу').max(100),
    group: z.string().trim().max(50),
    hint: z.string().trim().max(200),
    source: z.string(),
    field: z.string(),
    format: z.string(),
    value_mn: z.string().max(1000),
    value_en: z.string().max(1000),
  })
  .superRefine((v, ctx) => {
    if (v.kind !== 'field') {
      return;
    }
    const required = {
      source: 'Мэдээллээ сонгоно уу',
      field: 'Талбараа сонгоно уу',
      format: 'Форматаа сонгоно уу',
    } as const;
    for (const [name, message] of Object.entries(required)) {
      if (!v[name as keyof typeof required]) {
        ctx.addIssue({ code: 'custom', path: [name], message });
      }
    }
  });
type Values = z.infer<typeof schema>;

/** What the form sends: a builtin variable's label, group and note only; kind on creation. */
function bodyOf(v: Values, variable?: AdminVariableType): VariableBody {
  const body: VariableBody = {
    label: v.label,
    group: v.group || undefined,
    hint: v.hint || undefined,
  };
  if (variable?.builtin) {
    return body;
  }
  if (v.kind === 'field') {
    return {
      ...body,
      kind: variable ? undefined : 'field',
      source: v.source,
      field: v.field,
      format: v.format,
    };
  }
  return {
    ...body,
    kind: variable ? undefined : 'custom',
    value_mn: v.value_mn,
    value_en: v.value_en || undefined,
  };
}

/**
 * Creates an admin's variable, a field of the contract or a party in a format or a text, or
 * changes one: a builtin variable's name, group and note, an admin's field or texts too.
 */
export function VariableFormDialog({
  variable,
  trigger,
  onSubmit,
}: {
  /** The variable to change; left out to create one. */
  variable?: AdminVariableType;
  trigger: ReactNode;
  onSubmit: (body: VariableBody) => Promise<unknown>;
}) {
  const builtin = variable?.builtin ?? false;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { data: catalog } = useQuery(variableFieldsOptions());
  const defaults = (): Values => ({
    kind: variable?.kind ?? 'field',
    label: variable?.label ?? '',
    group: variable?.group ?? '',
    hint: variable?.hint ?? '',
    source: variable?.source ?? '',
    field: variable?.field ?? '',
    format: variable?.format ?? '',
    value_mn: variable?.value_mn ?? '',
    value_en: variable?.value_en ?? '',
  });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting, isSubmitted } = form.formState;
  const [kind, source, field, format] = useWatch({
    control: form.control,
    name: ['kind', 'source', 'field', 'format'],
  });

  async function submit(v: Values) {
    setError(null);
    try {
      await onSubmit(bodyOf(v, variable));
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (
        applyFieldErrors(e, form.setError, {
          label: 'label',
          group: 'group',
          hint: 'hint',
          source: 'source',
          field: 'field',
          format: 'format',
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
              {variable ? 'Хувьсагч засах' : 'Шинэ хувьсагч'}
            </DialogTitle>
            <DialogDescription>
              {kind === 'system'
                ? 'Утгыг систем гэрээний мэдээллээс бодно. Нэр, бүлэг, тайлбарыг нь засна.'
                : builtin
                  ? 'Ямар мэдээллийг хэвлэхийг систем тогтооно. Нэр, бүлэг, тайлбарыг нь засна.'
                  : variable
                    ? 'Шинэ утга дараагийн гэрээнээс хэвлэгдэнэ. Үүссэн гэрээ хуучин утгаа хадгална.'
                    : 'Загварын хоосон зайг энэ хувьсагчтай холбоход утга нь гэрээнд хэвлэгдэнэ.'}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            {!variable && (
              <VariableKindChoice
                value={kind === 'custom' ? 'custom' : 'field'}
                onChange={(k) => {
                  form.setValue('kind', k);
                  form.clearErrors();
                }}
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="label" label="Нэр" error={errors.label?.message}>
                <Input
                  id="label"
                  className="h-10"
                  placeholder={
                    kind === 'field'
                      ? 'Хамтран эзэмшигчийн нэр'
                      : 'Гаргагчийн нэр'
                  }
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
                  placeholder={
                    kind === 'field' ? 'Хамтран эзэмшигч' : 'Гаргагч'
                  }
                  aria-invalid={!!errors.group}
                  {...form.register('group')}
                />
              </FormField>
            </div>
            <FormField
              id="hint"
              label="Тайлбар"
              optional
              error={errors.hint?.message}
              hint="Холбохдоо нэрийн доор харагдана: жишээ эсвэл тэмдэглэл."
            >
              <Input
                id="hint"
                className="h-10"
                aria-invalid={!!errors.hint}
                {...form.register('hint')}
              />
            </FormField>
            {kind === 'field' &&
              (builtin ? (
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  <p className="text-xs text-muted-foreground">Хэвлэх утга</p>
                  <p>{describeField(catalog, { source, field, format })}</p>
                </div>
              ) : (
                <VariableFieldPicker
                  catalog={catalog}
                  value={{ source, field, format }}
                  errors={{
                    source: errors.source?.message,
                    field: errors.field?.message,
                    format: errors.format?.message,
                  }}
                  onChange={(next) => {
                    const opts = { shouldValidate: isSubmitted };
                    form.setValue('source', next.source, opts);
                    form.setValue('field', next.field, opts);
                    form.setValue('format', next.format, opts);
                  }}
                />
              ))}
            {kind === 'custom' && (
              <>
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
              </>
            )}
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
              {variable ? 'Хадгалах' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
