import { ReaderPage } from '@/components/reader/reader-page';

type PageProps = {
  params: Promise<{ chapterId: string }>;
};

export const metadata = {
  title: 'خواندن چپتر',
};

export default async function Page({ params }: PageProps) {
  const { chapterId } = await params;

  return <ReaderPage chapterId={chapterId} />;
}
