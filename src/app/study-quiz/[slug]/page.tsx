import { getQuizSetBySlug, getAllQuizSets } from '../../../data/quizRegistry';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  const sets = getAllQuizSets();
  return sets.map((s) => ({ slug: s.slug }));
}

export default async function DynamicQuizRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const set = getQuizSetBySlug(slug);

  if (set) {
    redirect(set.urlPath);
  }

  redirect('/test-series');
}
