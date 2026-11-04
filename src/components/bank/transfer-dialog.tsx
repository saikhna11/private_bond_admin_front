import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react';
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
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { showToast } from '@/lib/utils';
import { bankKeys } from '@/queries/bank/options';
import { createTransfer } from '@/queries/bank/query';
import { transferStatusLabel } from '@/queries/bank/type';
import { clientOptions } from '@/queries/client/options';
import { ClientPicker } from './client-picker';

const schema = z.object({
  user_id: z.string().min(1, 'Харилцагч сонгоно уу'),
  amount: z
    .string()
    .trim()
    .min(1, 'Дүн оруулна уу')
    .refine(
      (v) => /^\d{1,14}(\.\d{1,2})?$/.test(v) && Number(v) > 0,
      'Дүн 0-ээс их, хамгийн ихдээ 2 аравтын оронтой байна',
    ),
  description: z.string().trim().max(200, 'Тайлбар 200 тэмдэгтээс хэтрэхгүй'),
});

type Values = z.infer<typeof schema>;

/**
 * POST /bank/transfers: sends money from the company account to the client's registered
 * account. The account is not chosen here; the API always pays the one on file, and
 * verifies it with the bank first when it never was.
 */
export function TransferDialog({
  trigger,
  initialUserId,
}: {
  trigger: ReactNode;
  initialUserId?: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [conflict, setConflict] = useState(false);
  // Stable while the dialog is open: a retry after a lost answer cannot pay twice.
  const [key, setKey] = useState(() => crypto.randomUUID());

  const defaults = (): Values => ({
    user_id: initialUserId ?? '',
    amount: '',
    description: '',
  });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;
  const userId = form.watch('user_id');
  const { data: client, isPending: clientLoading } = useQuery({
    ...clientOptions(userId),
    enabled: !!userId,
  });
  const bank = client?.bank_account;

  async function submit(values: Values) {
    setError(null);
    setConflict(false);
    try {
      const transfer = await createTransfer(
        {
          user_id: values.user_id,
          amount: values.amount,
          description: values.description || undefined,
        },
        key,
      );
      await queryClient.invalidateQueries({ queryKey: bankKeys.all });
      setOpen(false);
      if (transfer.status === 'sent') {
        showToast('success', 'Шилжүүлэг илгээгдлээ.');
      } else {
        showToast(
          'warning',
          `Шилжүүлгийн төлөв: ${transferStatusLabel[transfer.status]}. Хуулгаар шалгана уу.`,
          8000,
        );
      }
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'bank.transfer_unknown') {
        // The bank may have sent it: the statement decides, never a retry.
        await queryClient.invalidateQueries({ queryKey: bankKeys.all });
        setOpen(false);
        showToast(
          'warning',
          'Шилжүүлгийн үр дүн тодорхойгүй байна. Хуулгаар шалгана уу; дахин илгээхгүй.',
          8000,
        );
        return;
      }
      if (e.code === 'bank.idempotency_conflict') {
        setConflict(true);
        setError(e);
        return;
      }
      if (
        applyFieldErrors(e, form.setError, {
          user_id: 'user_id',
          amount: 'amount',
          description: 'description',
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
          setKey(crypto.randomUUID());
          setError(null);
          setConflict(false);
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
            <DialogTitle>Шилжүүлэг илгээх</DialogTitle>
            <DialogDescription>
              Мөнгө компанийн данснаас харилцагчийн бүртгэлтэй данс руу шилжинэ.
              Данс баталгаажаагүй бол банкнаас эхлээд шалгана.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <FormField
              id="user_id"
              label="Харилцагч"
              error={errors.user_id?.message}
            >
              <Controller
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <ClientPicker
                    id="user_id"
                    value={field.value}
                    onChange={(id) => field.onChange(id ?? '')}
                  />
                )}
              />
            </FormField>

            {userId && (clientLoading || bank) && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                {clientLoading ? (
                  <p className="text-muted-foreground">
                    Харилцагчийг уншиж байна…
                  </p>
                ) : bank ? (
                  <>
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {bank.bank_name} · {bank.account_number}
                      {bank.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] text-success">
                          <ShieldCheckIcon className="size-3" />
                          Баталгаажсан
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] text-warning-foreground dark:text-warning">
                          <ShieldAlertIcon className="size-3" />
                          Баталгаажаагүй
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {bank.holder_account_name} · {bank.iban.toUpperCase()}
                    </p>
                    {bank.status !== 'verified' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Шилжүүлэхээс өмнө банкны CAM-аар автоматаар
                        баталгаажуулна.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-destructive">
                    <ShieldAlertIcon className="size-4" />
                    Энэ харилцагчид банкны данс бүртгэгдээгүй байна.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="amount"
                label="Дүн (MNT)"
                error={errors.amount?.message}
              >
                <Input
                  id="amount"
                  inputMode="decimal"
                  placeholder="1000.00"
                  className="tabular h-10"
                  aria-invalid={!!errors.amount}
                  {...form.register('amount')}
                />
              </FormField>
              <FormField
                id="description"
                label="Тайлбар"
                optional
                error={errors.description?.message}
              >
                <Input
                  id="description"
                  maxLength={200}
                  placeholder="Жишээ нь: Бондын төлбөр"
                  className="h-10"
                  aria-invalid={!!errors.description}
                  {...form.register('description')}
                />
              </FormField>
            </div>
          </FieldGroup>

          <ApiErrorAlert error={error} />
          {conflict && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setKey(crypto.randomUUID());
                  setConflict(false);
                  setError(null);
                }}
              >
                Шинэ түлхүүрээр үргэлжлүүлэх
              </Button>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Болих
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || !bank}
              className="h-10 px-5"
            >
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Илгээх
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
