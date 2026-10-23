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
import { Textarea } from '@/components/ui/textarea';
import { type ApiError, toApiError } from '@/lib/fetcher';

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Шалтгаанаа бичнэ үү')
    .max(500, '500 тэмдэгтээс хэтрэхгүй'),
});

const presets = [
  'Регистрийн дугаар иргэний үнэмлэхтэй таарахгүй байна',
  'Паспортын мэдээлэл буруу байна',
  'Холбоо барих утас буруу байна',
];

/** The reason goes to the client as is: write it for them. */
export function RejectDialog({
  trigger,
  onReject,
}: {
  trigger: ReactNode;
  onReject: (reason: string) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });
  const { errors, isSubmitting } = form.formState;
  const length = form.watch('reason').length;

  async function onSubmit({ reason }: z.infer<typeof schema>) {
    setError(null);
    try {
      await onReject(reason);
      setOpen(false);
      form.reset();
    } catch (err) {
      setError(toApiError(err));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setError(null);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Хүсэлтээс татгалзах</DialogTitle>
            <DialogDescription>
              Шалтгааныг харилцагч өөрөө харна. Тодорхой, эелдэг бичнэ үү.
            </DialogDescription>
          </DialogHeader>
          <FormField
            id="reason"
            label="Шалтгаан"
            error={errors.reason?.message}
            hint={<span className="tabular">{length} / 500</span>}
          >
            <Textarea
              id="reason"
              rows={4}
              maxLength={500}
              aria-invalid={!!errors.reason}
              {...form.register('reason')}
            />
          </FormField>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() =>
                  form.setValue('reason', p, { shouldValidate: true })
                }
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          <ApiErrorAlert error={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Болих
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Татгалзах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
