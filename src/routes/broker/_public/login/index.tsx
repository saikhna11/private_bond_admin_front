import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/login-form';
import { brokerPanelKeys } from '@/queries/broker-panel/options';
import { brokerLogin } from '@/queries/broker-panel/query';

export const Route = createFileRoute('/broker/_public/login/')({
  component: BrokerLoginPage,
});

function BrokerLoginPage() {
  return (
    <>
      <div className="mb-8 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Брокерын нэвтрэх
        </h2>
        <p className="text-sm text-muted-foreground">
          Админаас авсан имэйл, нууц үгээрээ нэвтэрнэ үү.
        </p>
      </div>
      <LoginForm
        signIn={brokerLogin}
        meKey={brokerPanelKeys.me()}
        home="/broker"
        hint="Нууц үгээ мартсан бол админд хандана уу."
      />
    </>
  );
}
