import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toApiError } from '@/lib/fetcher';
import { showToast } from '@/lib/utils';
import { paymentKeys } from '@/queries/payment/options';

/**
 * A dialog that asks one text of the admin about a statement credit and sends it: the order's
 * reference to link it to, or the note to dismiss it with. send answers the toast to show.
 */
export function CreditActionDialog({
  trigger,
  title,
  description,
  label,
  placeholder,
  action,
  multiline = false,
  send,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  action: string;
  multiline?: boolean;
  send: (text: string) => Promise<string>;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: () => send(text.trim()),
    onSuccess: (message) => {
      showToast('success', message);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err) => setError(toApiError(err).message),
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setText('');
          setError('');
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="credit-action-text">{label}</Label>
          {multiline ? (
            <Textarea
              id="credit-action-text"
              maxLength={500}
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <Input
              id="credit-action-text"
              className="uppercase"
              maxLength={40}
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Болих</Button>
          </DialogClose>
          <Button
            disabled={!text.trim() || run.isPending}
            onClick={() => run.mutate()}
          >
            {run.isPending && <Loader2Icon className="animate-spin" />}
            {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
