'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { Menu, X, LogOut, UserRound } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

type NavItem = { href: string; label: string; adminOnly?: boolean };

const navItems: NavItem[] = [
 { href: '/', label: 'خانه' },
 { href: '/manga', label: 'مانهوا' },
 { href: '/chat', label: 'چت' },
 { href: '/team', label: 'تیم' },
 { href: '/polls', label: 'رأی‌گیری' },
 { href: '/tickets', label: 'پشتیبانی' },
 { href: '/profile', label: 'پروفایل' },
 { href: '/admin', label: 'مدیریت', adminOnly: true },
];

function canSeeAdmin(user?: { role?: string } | null) {
 return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

export function AppShell({ children }: { children: ReactNode }) {
 const pathname = usePathname();
 const [open, setOpen] = useState(false);
 const user = useAuthStore((s) => s.user);
 const logoutStore = useAuthStore((s) => s.logout);

 const visible = navItems.filter((i) => !i.adminOnly || canSeeAdmin(user));

 async function logout() {
 try { await apiPost('/auth/logout'); } catch {}
 logoutStore();
 window.location.href = '/auth';
 }

 return (
 <div className="flex min-h-screen bg-hell-bg">
 {/* Sidebar - desktop */}
 <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-l border-hell-border bg-hell-card lg:flex lg:flex-col">
 <div className="border-b border-hell-border p-4">
 <Link href="/" className="flex items-center gap-2 font-black text-lg">
 <span className="text-hell-violet">هل</span> مانهوا
 </Link>
 </div>
 <nav className="flex-1 p-2">
 {visible.map((item) => {
 const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
 return (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
 'block rounded-lg px-3 py-2 text-sm font-bold transition-colors',
 active ? 'bg-hell-violet text-white' : 'text-hell-muted hover:bg-hell-purple/30 hover:text-white',
 )}
 >
 {item.label}
 </Link>
 );
 })}
 </nav>
 <div className="border-t border-hell-border p-3">
 {user ? (
 <div className="flex items-center gap-2">
 <Link href="/profile" className="flex flex-1 items-center gap-2 rounded-lg p-2 hover:bg-hell-purple/30">
 <div className="grid h-8 w-8 place-items-center rounded-md bg-hell-violet">
 {user.avatar ? <img src={user.avatar} alt={user.username} className="h-full w-full rounded-md object-cover" /> : <UserRound size={16} />}
 </div>
 <div className="min-w-0">
 <div className="truncate text-xs font-bold">{user.displayName || user.username}</div>
 <div className="truncate text-[10px] text-hell-muted">{user.role}</div>
 </div>
 </Link>
 <button onClick={logout} className="rounded-lg p-2 text-hell-muted hover:bg-red-600/20 hover:text-white" aria-label="خروج">
 <LogOut size={18} />
 </button>
 </div>
 ) : (
 <Link href="/auth" className="block rounded-lg bg-hell-violet px-3 py-2 text-center text-sm font-bold text-white">
 ورود
 </Link>
 )}
 </div>
 </aside>

 {/* Mobile drawer */}
 {open && (
 <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
 <aside className="h-full w-60 border-l border-hell-border bg-hell-card" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-between border-b border-hell-border p-4">
 <span className="font-black"><span className="text-hell-violet">هل</span> مانهوا</span>
 <button onClick={() => setOpen(false)}><X size={20} /></button>
 </div>
 <nav className="p-2">
 {visible.map((item) => {
 const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setOpen(false)}
 className={cn(
 'block rounded-lg px-3 py-2 text-sm font-bold transition-colors',
 active ? 'bg-hell-violet text-white' : 'text-hell-muted hover:bg-hell-purple/30 hover:text-white',
 )}
 >
 {item.label}
 </Link>
 );
 })}
 </nav>
 </aside>
 </div>
 )}

 {/* Main */}
 <div className="flex min-w-0 flex-1 flex-col">
 <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hell-border bg-hell-bg px-4">
 <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="منو">
 <Menu size={24} />
 </button>
 <span className="font-black lg:hidden"><span className="text-hell-violet">هل</span> مانهوا</span>
 {user ? (
 <button onClick={logout} className="text-hell-muted hover:text-white"><LogOut size={20} /></button>
 ) : (
 <Link href="/auth" className="rounded-lg bg-hell-violet px-3 py-1.5 text-sm font-bold text-white">ورود</Link>
 )}
 </header>
 <main className="flex-1 p-4">{children}</main>
 </div>
 </div>
 );
}