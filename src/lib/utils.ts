import { toast } from 'sonner';

export { cn } from 'cn';

export const showToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  duration = 5000,
) => {
  toast[type](message, {
    position: 'top-right',
    duration,
    closeButton: true,
  });
};
