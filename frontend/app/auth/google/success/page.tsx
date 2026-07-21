'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { apiGet } from '@/lib/api';
import type { User } from '@/lib/types';

export default function GoogleSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      router.replace(`/auth?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!accessToken || !refreshToken) {
      router.replace('/auth?error=oauth_incomplete');
      return;
    }

    // Store tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Fetch user profile
    apiGet<User>('/auth/me').then((user) => {
      setAuth({ user, accessToken, refreshToken });
      const next = params.get('next') || '/profile';
      router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/profile');
    }).catch(() => {
      router.replace('/auth?error=profile_fetch_failed');
    });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-hell-bg p-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-hell-violet border-t-transparent" />
        <p className="text-lg font-bold text-hell-light">در حال ورود...</p>
        <p className="mt-1 text-sm text-hell-muted">ورود با گوگل در حال تکمیل است</p>
      </div>
    </main>
  );
}