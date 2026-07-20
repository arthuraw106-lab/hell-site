'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
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
  const [error, setError] = useState('');

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

  return (
    <main className="grid min-h-screen place-items-center bg-hell-bg p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black"><span className="text-hell-violet">هل</span> مانهوا</h1>
          <p className="mt-1 text-sm text-hell-muted">{mode === 'login' ? 'ورود به حساب' : 'ساخت حساب جدید'}</p>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex rounded-lg border border-hell-border bg-hell-bg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-md py-1.5 text-sm font-bold ${mode === 'login' ? 'bg-hell-violet text-white' : 'text-hell-muted'}`}
            >ورود</button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-md py-1.5 text-sm font-bold ${mode === 'register' ? 'bg-hell-violet text-white' : 'text-hell-muted'}`}
            >ثبت‌نام</button>
          </div>

          <button
            onClick={() => (window.location.href = `${API_URL}/auth/google`)}
            className="mb-3 w-full rounded-lg border border-hell-border bg-hell-card py-2 text-sm font-bold hover:bg-hell-purple/30"
          >ورود با Google</button>

          <div className="mb-3 flex items-center gap-2 text-xs text-hell-muted">
            <span className="h-px flex-1 bg-hell-border" /> یا <span className="h-px flex-1 bg-hell-border" />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute right-3 top-2.5 text-hell-muted" size={16} />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ایمیل" type="email" className="pr-9" />
            </div>
            {mode === 'register' && (
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="نام کاربری" />
            )}
            <div className="relative">
              <Lock className="absolute right-3 top-2.5 text-hell-muted" size={16} />
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="پسورد" type="password" className="pr-9" />
            </div>
            {error && <p className="rounded-md bg-red-600/20 p-2 text-sm text-red-300">{error}</p>}
            <Button onClick={submit} disabled={loading || !email || !password} className="w-full">
              {loading ? '...' : mode === 'login' ? 'ورود' : 'ساخت حساب'}
            </Button>
          </div>

          <p className="mt-3 text-center text-[10px] text-hell-muted">دمو: admin@hell.local / Admin123456</p>
        </div>
      </div>
    </main>
  );
}