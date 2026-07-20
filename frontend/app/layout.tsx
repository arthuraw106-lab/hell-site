import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
 title: {
 default: 'هل مانهوا | Hell Manhwa',
 template: '%s | هل مانهوا',
 },
 description: 'سایت مدرن خواندن مانهوا، چت، استوری، ترجمه و پنل مدیریت',
 openGraph: {
 title: 'هل مانهوا',
 description: 'تجربه حرفه‌ای خواندن مانهوا با ترجمه فارسی',
 type: 'website',
 },
 robots: {
 index: true,
 follow: true,
 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
 <body>
 <Providers>{children}</Providers>
 </body>
 </html>
 );
}
