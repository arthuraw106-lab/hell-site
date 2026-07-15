import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-black">هل مانهوا</h2>
          <p className="mt-3 leading-7 text-white/50">
            پلتفرم فارسی مانهوا با خواندن آنلاین، استوری، چت، تیم ترجمه و پنل مدیریت.
          </p>
        </div>
        <div className="grid gap-2 text-white/55">
          <Link href="/manga">مانهواها</Link>
          <Link href="/team">درخواست عضویت تیم</Link>
          <Link href="/tickets">پشتیبانی</Link>
        </div>
        <div className="text-white/45">
          © {new Date().getFullYear()} Hell Manhwa
        </div>
      </div>
    </footer>
  );
}
