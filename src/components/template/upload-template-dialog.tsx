import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { fileToBase64, MAX_TEMPLATE_BYTES } from '@/lib/file';
import { applyFieldErrors } from '@/lib/form-errors';
import { contractProductsOptions } from '@/queries/template/options';
import { uploadTemplate } from '@/queries/template/query';
import {
  type Language,
  LanguageSchema,
  languageLabel,
  ownershipLabel,
  type TemplateDetailType,
} from '@/queries/template/type';

const schema = z.object({
  product: z.string().min(1, 'Бүтээгдэхүүнээ сонгоно уу'),
  language: LanguageSchema,
  name: z.string().trim().min(1, 'Загварын нэрээ оруулна уу').max(200),
  file: z
    .instanceof(File, { message: 'Word (.docx) файлаа сонгоно уу' })
    .refine((f) => f.name.toLowerCase().endsWith('.docx'), {
      message: 'Зөвхөн Word (.docx) файл оруулна',
    })
    .refine((f) => f.size <= MAX_TEMPLATE_BYTES, {
      message: 'Файл 5 MB-аас ихгүй байна',
    }),
});

type Values = z.infer<typeof schema>;

/** Uploads a .docx as a new draft template of a product. */
export function UploadTemplateDialog({
  trigger,
  onUploaded,
}: {
  trigger: ReactNode;
  onUploaded: (t: TemplateDetailType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { data: products } = useQuery(contractProductsOptions());
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { product: '', language: 'mn', name: '' },
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(values: Values) {
    setError(null);
    try {
      const t = await uploadTemplate({
        product: values.product,
        language: values.language,
        name: values.name,
        file: await fileToBase64(values.file),
      });
      setOpen(false);
      onUploaded(t);
    } catch (err) {
      const e = toApiError(err);
      if (
        !applyFieldErrors(e, form.setError, {
          product: 'product',
          language: 'language',
          name: 'name',
          file: 'file',
        })
      ) {
        setError(e);
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          form.reset({ product: '', language: 'mn', name: '' });
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
            <DialogTitle>Гэрээний загвар оруулах</DialogTitle>
            <DialogDescription>
              Хоосон зайг Word дээр {'{нэр}'} гэж бичнэ. Гарын үсгийн зургийн
              Alt Text нь эзэмшигчийнх signature, хамтран эзэмшигчийнх
              signature_co байна.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="product"
                label="Бүтээгдэхүүн"
                error={errors.product?.message}
              >
                <Controller
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="product"
                        className="h-10! w-full"
                        aria-invalid={!!errors.product}
                      >
                        <SelectValue placeholder="Сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((p) => (
                          <SelectItem key={p.name} value={p.name}>
                            {p.name} · {ownershipLabel[p.ownership_type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField
                id="language"
                label="Хэл"
                error={errors.language?.message}
              >
                <Controller
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as Language)}
                    >
                      <SelectTrigger id="language" className="h-10! w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LanguageSchema.options.map((l) => (
                          <SelectItem key={l} value={l}>
                            {languageLabel[l]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <FormField
              id="file"
              label="Word файл"
              error={errors.file?.message}
              hint=".docx, 5 MB хүртэл"
            >
              <Controller
                control={form.control}
                name="file"
                render={({ field }) => (
                  <Input
                    id="file"
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="h-10"
                    aria-invalid={!!errors.file}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                      if (file && !form.getValues('name')) {
                        form.setValue(
                          'name',
                          file.name.replace(/\.docx$/i, ''),
                        );
                      }
                    }}
                  />
                )}
              />
            </FormField>
            <FormField id="name" label="Нэр" error={errors.name?.message}>
              <Input
                id="name"
                className="h-10"
                aria-invalid={!!errors.name}
                {...form.register('name')}
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
              Оруулах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
