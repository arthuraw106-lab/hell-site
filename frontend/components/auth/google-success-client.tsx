'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function GoogleSuccessClient() {
  const router = useRouter();
  const [message, setMessage] = useState('در حال تکمیل ورود...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setMessage('توکن ورود پیدا نشد. لطفاً دوباره وارد شوید.');

      window.setTimeout(() => {
        router.replace('/auth');
      }, 1500);

      return;
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setMessage('ورود موفق بود. در حال انتقال به پروفایل...');

    window.setTimeout(() => {
      router.replace('/profile');
    }, 500);
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-black">{message}</h1>
      <p className="mt-3 text-white/50">چند لحظه صبر کن.</p>
    </div>
  );
}
