'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050509]/72 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="text-xl font-black">
          هل مانهوا
        </Link>

        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white/45 md:flex">
          <Search size={18} />
          جستجو
        </div>

        <Link href="/auth">
          <Button size="sm">ورود</Button>
        </Link>
      </nav>
    </header>
  );
}
