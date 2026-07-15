import type { Metadata } from 'next';
import { MangaDetailPage } from '@/components/manga/manga-detail-page';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `مانهوا ${slug}`,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <MangaDetailPage slug={slug} />;
}
