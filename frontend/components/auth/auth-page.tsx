'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiPost, API_URL } from '@/lib/api';
import { User } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuthResult = { user: User; accessToken: string; refreshToken: string };

function getNextPath() {
  if (typeof window === 'undefined') return '/profile';
  const next = new URLSearchParams(window.location.search).get('next');
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/profile';
  return next;
}

export function AuthPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('admin@hell.local');
  const [password, setPassword] = useState('Admin123456');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const backendOrigin = new URL(API_URL).origin;

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: email.trim() || undefined, password }
        : { email, password, username: username || email.split('@')[0] };
      const result = await apiPost<AuthResult>(endpoint, payload);
      setAuth(result);
      router.replace(getNextPath());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  function googleLogin() {
    setGoogleLoading(true);
    setError('');
    // Redirect to backend Google OAuth endpoint
    const next = encodeURIComponent(getNextPath());
    window.location.href = `${backendOrigin}/api/auth/google?next=${next}`;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-hell-bg p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black"><span className="text-hell-violet">هل</span> مانهوا</h1>
          <p className="mt-1 text-sm text-hell-muted">{mode === 'login' ? 'ورود به حساب' : 'ساخت حساب جدید'}</p>
        </div>

        <div className="card p-5 space-y-4">
          {/* Mode tabs */}
          <div className="flex rounded-lg border border-hell-border bg-hell-bg p-1">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-md py-1.5 text-sm font-bold transition ${mode === 'login' ? 'bg-hell-card text-hell-light' : 'text-hell-muted'}`}>ورود</button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-md py-1.5 text-sm font-bold transition ${mode === 'register' ? 'bg-hell-card text-hell-light' : 'text-hell-muted'}`}>ثبت‌نام</button>
          </div>

          {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</div> : null}

          {mode === 'register' ? (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold">نام کاربری</span>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            </label>
          ) : null}

          <label className="grid gap-1.5">
            <span className="text-xs font-bold">ایمیل</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold">رمز عبور</span>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••" />
          </label>

          <Button className="w-full" disabled={loading} onClick={submit}>
            {loading ? '...' : mode === 'login' ? 'ورود' : 'ثبت‌نام'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-hell-border" />
            <span className="text-xs text-hell-muted">یا</span>
            <div className="h-px flex-1 bg-hell-border" />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={googleLogin}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-hell-border bg-hell-card px-4 py-2.5 text-sm font-bold transition hover:bg-hell-bg disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'در حال انتقال...' : 'ورود با گوگل'}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-hell-muted">
          هویت شما فقط برای ورود استفاده می‌شود.
        </p>
      </div>
    </main>
  );
}