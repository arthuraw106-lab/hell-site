'use client';

import {
  BarChart3,
  BookOpen,
  Flame,
  Headphones,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Shield,
  UserRound,
  UsersRound,
  Vote,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { AnimatedBackground } from '@/components/effects/animated-background';
import { Button } from '@/components/ui/button';
import { apiPost } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: '/', label: 'خانه', icon: Home },
  { href: '/manga', label: 'کتابخانه مانهوا', icon: BookOpen },
  { href: '/chat', label: 'چت داخلی', icon: MessageCircle },
  { href: '/team', label: 'تیم ترجمه', icon: UsersRound },
  { href: '/polls', label: 'رأی‌گیری پروژه‌ها', icon: Vote },
  { href: '/tickets', label: 'پشتیبانی', icon: LifeBuoy },
  { href: '/profile', label: 'پروفایل', icon: UserRound },
  { href: '/admin', label: 'پنل مدیریت', icon: Shield, adminOnly: true },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function canSeeAdmin(user: any) {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.adminOnly) return true;
      return canSeeAdmin(user);
    });
  }, [user]);

  const pageTitle = useMemo(() => {
    const found = visibleNavItems.find((item) => isActive(pathname, item.href));
    if (pathname.startsWith('/admin')) return canSeeAdmin(user) ? 'پنل مدیریت' : 'دسترسی محدود';
    return found?.label || 'هل مانهوا';
  }, [pathname, user, visibleNavItems]);

  async function logout() {
    try {
      await apiPost('/auth/logout');
    } catch {}
    logoutStore();
    window.location.href = '/auth';
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-hell-void text-white">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-l border-white/10 bg-[#070711]/82 backdrop-blur-2xl lg:flex lg:flex-col">
          <SidebarContent pathname={pathname} user={user} navItems={visibleNavItems} onLogout={logout} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
            <aside
              className="h-full w-80 max-w-[85vw] border-l border-white/10 bg-[#070711] p-0"
              onClick={(event) => event.stopPropagation()}
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                navItems={visibleNavItems}
                onLogout={logout}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050509]/72 backdrop-blur-2xl">
            <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="باز کردن منو"
                >
                  <Menu />
                </button>

                <div>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <Flame size={15} className="text-hell-violet" />
                    Hell Manhwa Platform
                  </div>
                  <h1 className="mt-1 truncate text-xl font-black md:text-2xl">{pageTitle}</h1>
                </div>
              </div>

              <div className="hidden w-full max-w-md items-center rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 md:flex">
                <Search size={18} className="text-white/35" />
                <input
                  placeholder="جستجوی سریع مانهوا..."
                  className="mr-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      const value = event.currentTarget.value.trim();
                      if (value) window.location.href = `/manga?q=${encodeURIComponent(value)}`;
                    }
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <Link href="/profile" className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 md:flex">
                      <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-hell-purple to-hell-violet">
                        {user.avatar ? <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" /> : <UserRound size={18} />}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black">{user.displayName || user.username}</div>
                        <div className="text-xs text-white/40">{user.role}</div>
                      </div>
                    </Link>

                    <Button variant="ghost" size="sm" onClick={logout} aria-label="خروج">
                      <LogOut size={18} />
                    </Button>
                  </>
                ) : (
                  <Link href="/auth">
                    <Button size="sm">ورود</Button>
                  </Link>
                )}
              </div>
            </div>
          </header>

          <main className="relative min-w-0 flex-1 pb-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  navItems,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  user?: any;
  navItems: NavItem[];
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" onClick={onNavigate} className="group flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-hell-purple via-hell-violet to-hell-indigo shadow-violet transition group-hover:rotate-6">
              <Flame />
            </div>
            <div>
              <strong className="block text-lg">هل مانهوا</strong>
              <small className="text-white/42">Dark Purple Reader</small>
            </div>
          </Link>

          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 lg:hidden" onClick={onNavigate}>
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto p-4">
        <div className="mb-3 px-3 text-xs font-black uppercase tracking-widest text-white/30">
          منو
        </div>

        <div className="grid gap-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 font-bold transition',
                  active
                    ? 'bg-gradient-to-l from-hell-purple/32 to-hell-violet/18 text-white shadow-soft'
                    : 'text-white/58 hover:bg-white/[0.055] hover:text-white',
                )}
              >
                {active ? <span className="absolute bottom-2 right-0 top-2 w-1 rounded-l-full bg-hell-cyan" /> : null}
                <span
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl transition',
                    active ? 'bg-white/12 text-hell-cyan' : 'bg-white/[0.045] text-white/45 group-hover:text-white',
                  )}
                >
                  <Icon size={19} />
                </span>
                <span>{item.label}</span>
                {item.adminOnly ? (
                  <span className="mr-auto rounded-full bg-hell-violet/20 px-2 py-1 text-[10px] text-violet-100">
                    ADMIN
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-hell-violet/20 bg-hell-violet/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-hell-cyan">
            <BarChart3 size={18} />
            <strong>وضعیت سیستم</strong>
          </div>
          <p className="text-sm leading-6 text-white/48">
            API، چت، آپلود ZIP و استوری فعال هستند.
          </p>
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        {user ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <Link href="/profile" onClick={onNavigate} className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-hell-purple to-hell-violet">
                {user.avatar ? <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" /> : <UserRound size={20} />}
              </div>
              <div className="min-w-0">
                <div className="truncate font-black">{user.displayName || user.username}</div>
                <div className="truncate text-xs text-white/40">{user.email || user.role}</div>
              </div>
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-red-500/20 hover:text-white"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        ) : (
          <Link href="/auth" onClick={onNavigate} className="block rounded-2xl bg-hell-violet px-4 py-3 text-center font-black shadow-violet">
            ورود / ثبت‌نام
          </Link>
        )}

        <a
          href="https://t.me/"
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-black text-sky-200 transition hover:bg-sky-400/15"
        >
          <Headphones size={16} />
          ورود سریع تلگرام
        </a>
      </div>
    </div>
  );
}
