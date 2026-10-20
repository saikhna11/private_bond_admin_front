import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/login/')({
  component: LoginPage,
});

function LoginPage() {
  // TODO: login form (react-hook-form + zod) once the auth API is defined.
  return <h1 className="text-xl font-semibold">Нэвтрэх</h1>;
}
