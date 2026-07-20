'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import PollProjectsAdminCard from '@/components/admin/poll-projects-admin-card';

export default function Page() {
 const user = useAuthStore((state) => state.user);
 const hydrated = useAuthStore((state) => state.hydrated);

 if (!hydrated) {
 return (
 <AppShell>
 <main className="mx-auto max-w-4xl px-5 py-10">
 <div className="h-80 rounded-[2.5rem] skeleton" />
 </main>
 </AppShell>
 );
 }

 if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
 return (
 <AppShell>
 <main className="mx-auto max-w-4xl px-5 py-10">
 <div className="card rounded-[2.5rem] p-8 text-center">
 <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-red-500/10 text-red-200">
 <ShieldAlert size={42} />
 </div>
 <h1 className="mt-6 text-3xl font-black">دسترسی ادمین لازم است</h1>
 <p className="mx-auto mt-3 max-w-md leading-7 text-white/50">
 این بخش فقط برای ادمین‌ها نمایش داده می‌شود. اگر ادمین هستی، با حساب ادمین وارد شو.
 </p>
 <div className="mt-6 flex justify-center gap-3">
 <Link href="/auth?next=/admin">
 <Button>ورود با حساب ادمین</Button>
 </Link>
 <Link href="/">
 <Button variant="secondary">بازگشت خانه</Button>
 </Link>
 </div>
 </div>

 <div className="mt-8">
 <PollProjectsAdminCard />
 </div>
</main>
 </AppShell>
 );
 }

 return <AdminPage />;
}
