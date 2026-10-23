import StudyQuizPage from '../../../views/StudyQuizPage';
import { getQuizSetBySlug, getAllQuizSets } from '../../../data/quizRegistry';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const sets = getAllQuizSets();
  return sets.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const set = getQuizSetBySlug(slug);

  if (!set) {
    return {
      title: 'Quiz Not Found | Career Diary',
    };
  }

  const title = `${set.title} 2026 – Online Mock Test & Practice Set | Career Diary`;
  const description = `${set.subtitle}. Practice ${set.total_questions} questions for ${set.exam} with instant scoring, negative marking and solutions on Career Diary.`;
  const url = `https://careerdiary.in/study-quiz/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Career Diary',
      type: 'website',
    },
  };
}

export default async function DynamicQuizRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const set = getQuizSetBySlug(slug);

  if (!set) {
    notFound();
  }

  return <StudyQuizPage initialSlug={slug} initialMode="hub" />;
}
