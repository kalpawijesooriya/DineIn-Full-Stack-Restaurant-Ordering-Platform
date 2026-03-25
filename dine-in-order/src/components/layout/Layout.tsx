import { Outlet } from 'react-router-dom';
import { FloatingCartButton } from '@/components/layout/FloatingCartButton';
import { Header } from '@/components/layout/Header';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24">
        <Outlet />
      </main>
      <FloatingCartButton />
    </div>
  );
}
