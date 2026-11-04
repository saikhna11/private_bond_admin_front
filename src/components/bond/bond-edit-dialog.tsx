import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
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
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { showToast } from '@/lib/utils';
import { bondKeys } from '@/queries/bond/options';
import { updateBond } from '@/queries/bond/query';
import type { BondDetailType } from '@/queries/bond/type';
import { BondFormFields } from './bond-form-fields';
import {
  type BondFormValues,
  bondBody,
  bondDefaults,
  bondFieldNames,
  useBondForm,
} from './use-bond-form';

/** Changes a bond's terms; its rate options and files change on the page itself. */
export function BondEditDialog({ b }: { b: BondDetailType }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const form = useBondForm(b);

  async function submit(v: BondFormValues) {
    setError(null);
    try {
      await updateBond(b.id, bondBody(v));
      showToast('success', 'Бондын нөхцөл хадгалагдлаа');
      await queryClient.invalidateQueries({ queryKey: bondKeys.all });
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (!applyFieldErrors(e, form.setError, bondFieldNames)) setError(e);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          form.reset(bondDefaults(b));
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <PencilIcon />
          Засах
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle>Бондын нөхцөл засах</DialogTitle>
            <DialogDescription>
              Гэрээтэй болсон бондын код, валют өөрчлөгдөхгүй. Дуусах огноог
              сунгавал огноогоор хаагдсан бонд дахин нээгдэнэ.
            </DialogDescription>
          </DialogHeader>
          <BondFormFields form={form} />
          <ApiErrorAlert error={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Болих
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2Icon className="animate-spin" />
              )}
              Хадгалах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
