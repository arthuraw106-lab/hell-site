import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { ProButton } from '@/components/ui/pro-button';

export default function NotFound() {
 return (
 <main className="grid min-h-screen place-items-center bg-hell-bg p-6 text-white">
 <div className="card max-w-lg rounded-[2.5rem] p-8 text-center">
 <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/[0.06] text-white/35">
 <SearchX size={42} />
 </div>
 <h1 className="mt-6 text-4xl font-black">صفحه پیدا نشد</h1>
 <p className="mt-3 leading-7 text-white/50">
 آدرسی که وارد کردی وجود نداره یا منتقل شده.
 </p>
 <Link href="/" className="mt-6 inline-block">
 <ProButton>بازگشت به خانه</ProButton>
 </Link>
 </div>
 </main>
 );
}
