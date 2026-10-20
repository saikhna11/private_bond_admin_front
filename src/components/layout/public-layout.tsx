import { Outlet } from '@tanstack/react-router';

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
