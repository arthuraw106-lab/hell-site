import { Suspense } from 'react';
import { MangaListPage } from '@/components/manga/manga-list-page';

export const metadata = {
  title: 'مانهواها',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-hell-void p-8 text-white">در حال بارگذاری...</div>}>
      <MangaListPage />
    </Suspense>
  );
}
