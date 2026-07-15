'use client';

import { Flame, Lock, Mail, Sparkles, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatedBackground } from '@/components/effects/animated-background';
import { apiPost, API_URL } from '@/lib/api';
import { User } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AuthResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

function getNextPath() {
  if (typeof window === 'undefined') return '/profile';

  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');

  if (!next) return '/profile';

  if (!next.startsWith('/')) return '/profile';

  if (next.startsWith('//')) return '/profile';

  return next;
}

export function AuthPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('admin@hell.local');
  const [password, setPassword] = useState('Admin123456');
  const [username, setUsername] = useState('admin');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit() {
    setLoading(true);
    setMessage('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

      const payload =
        mode === 'login'
          ? { email: email.trim() || undefined, username: username.trim() || undefined, password }
          : { email, password, username, displayName: displayName || username };

      const result = await apiPost<AuthResult>(endpoint, payload);

      setAuth(result);

      const nextPath = getNextPath();
      router.replace(nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-10 text-white">
      <AnimatedBackground />

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <div className="hidden lg:block animate-reveal">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-hell-red/15 px-4 py-2 text-sm font-bold text-red-100">
            <Sparkles size={16} />
            ورود به دنیای هل مانهوا
          </div>
          <h1 className="text-7xl font-black leading-tight">
            اکانتت رو بساز و <span className="text-gradient">ادامه بده</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-9 text-white/55">
            بوکمارک، تاریخچه خواندن، چت، تیکت و امکانات حرفه‌ای فقط با حساب کاربری فعال می‌شن.
          </p>
        </div>

        <div className="animate-reveal" style={{ animationDelay: '0.15s' }}>

          <Card className="neo-card relative w-full overflow-hidden rounded-[2.5rem] p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-hell-red via-hell-gold to-purple-500" />

            <div className="mb-7 text-center">
              <div className="pulse-glow mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-hell-red to-purple-600">
                <Flame />
              </div>
              <h2 className="mt-4 text-3xl font-black">
                {mode === 'login' ? 'خوش برگشتی' : 'ساخت حساب جدید'}
              </h2>
              <p className="mt-2 text-sm text-white/50">ورود با ایمیل و پسورد</p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.05] p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={mode === 'login' ? 'rounded-xl bg-hell-red px-4 py-3 font-black' : 'rounded-xl px-4 py-3 text-white/55'}
              >
                ورود
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={mode === 'register' ? 'rounded-xl bg-hell-red px-4 py-3 font-black' : 'rounded-xl px-4 py-3 text-white/55'}
              >
                ثبت‌نام
              </button>
            </div>

            <div className="grid gap-4">
              <Button variant="secondary" onClick={loginWithGoogle}>
                ورود با Google
              </Button>

              <div className="flex items-center gap-3 text-xs text-white/35">
                <span className="h-px flex-1 bg-white/10" />
                یا
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="relative">
                <Mail className="absolute right-4 top-3.5 text-white/35" size={18} />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ایمیل" type="email" className="pr-11" />
              </div>

              {mode === 'register' ? (
                <>
                  <div className="relative">
                    <UserRound className="absolute right-4 top-3.5 text-white/35" size={18} />
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="نام کاربری" className="pr-11" />
                  </div>

                  <div className="relative">
                    <UserRound className="absolute right-4 top-3.5 text-white/35" size={18} />
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="نام نمایشی، اختیاری" className="pr-11" />
                  </div>
                </>
              ) : null}

              <div className="relative">
                <Lock className="absolute right-4 top-3.5 text-white/35" size={18} />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="پسورد" type="password" className="pr-11" />
              </div>

              {message ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
                  {message}
                </div>
              ) : null}

              <Button onClick={submit} disabled={loading || !email.trim() || !password.trim()}>
                {loading ? 'در حال پردازش...' : mode === 'login' ? 'ورود' : 'ساخت حساب'}
              </Button>

              <p className="text-center text-xs leading-6 text-white/40">
                ادمین تستی: admin@hell.local
                <br />
                پسورد: Admin123456
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
