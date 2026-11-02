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
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import {
  type ContractWordType,
  type WordCategory,
  wordCodeField,
} from '@/queries/word/type';

const schema = z.object({
  code: z.string().trim().max(100),
  value_mn: z.string().trim().min(1, 'Монгол утгаа оруулна уу').max(200),
  value_en: z.string().trim().min(1, 'Англи утгаа оруулна уу').max(200),
});
type Values = z.infer<typeof schema>;

/**
 * Corrects what the contracts print for a word, in both languages, or adds an admin's word of
 * category with its code when word is left out.
 */
export function WordFormDialog({
  word,
  category,
  title,
  trigger,
  onSubmit,
}: {
  /** The word to correct; left out to add one. */
  word?: ContractWordType;
  category: WordCategory;
  /** What the word is, as the table names it, or what adding one is called. */
  title: string;
  trigger: ReactNode;
  onSubmit: (body: Values) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const codeField = word ? undefined : wordCodeField[category];
  const defaults = (): Values => ({
    code: word?.code ?? '',
    value_mn: word?.value_mn ?? '',
    value_en: word?.value_en ?? '',
  });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(v: Values) {
    setError(null);
    if (codeField && !v.code) {
      form.setError('code', { message: 'Энэ талбарыг бөглөнө үү' });
      return;
    }
    try {
      await onSubmit(v);
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (
        applyFieldErrors(e, form.setError, {
          code: 'code',
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
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {word
                ? 'Шинэ үг дараагийн гэрээнээс хэвлэгдэнэ. Үүссэн гэрээ хуучин үгээ хадгална.'
                : 'Гэрээний өгөгдөлд энэ код байвал гэрээнд энэ үг хэвлэгдэнэ.'}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            {codeField && (
              <FormField
                id="code"
                label={codeField.label}
                error={errors.code?.message}
                hint={codeField.hint}
              >
                <Input
                  id="code"
                  className="h-10"
                  aria-invalid={!!errors.code}
                  {...form.register('code')}
                />
              </FormField>
            )}
            <FormField
              id="value_mn"
              label="Монгол загварт"
              error={errors.value_mn?.message}
              hint={
                category === 'bank'
                  ? 'Загвар «банк» гэдгийг өөрөө нэмдэг тул үггүй бичнэ.'
                  : undefined
              }
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
              label="Англи загварт"
              error={errors.value_en?.message}
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
              {word ? 'Хадгалах' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
