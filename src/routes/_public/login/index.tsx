import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/login-form';

export const Route = createFileRoute('/_public/login/')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <>
      <div className="mb-8 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ажилтны нэвтрэх
        </h2>
        <p className="text-sm text-muted-foreground">
          Байгууллагын имэйл, нууц үгээрээ нэвтэрнэ үү.
        </p>
      </div>
      <LoginForm />
    </>
  );
}
