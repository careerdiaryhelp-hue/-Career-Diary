import StudyQuizPage from '../../../../views/StudyQuizPage';
import { getQuizSetByExamAndSet, getAllQuizSets, getQuizSetBySlug } from '../../../../data/quizRegistry';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const sets = getAllQuizSets();
  const params: { exam: string; set: string }[] = [];

  for (const s of sets) {
    // Primary clean route: e.g. /test-series/bssc-cgl/set1
    params.push({ exam: s.examSlug, set: s.setSlug });
    // Also support hyphenated alias: e.g. /test-series/bssc-cgl/set-1
    const hyphenated = s.setSlug.replace(/^set(\d+)$/, 'set-$1');
    if (hyphenated !== s.setSlug) {
      params.push({ exam: s.examSlug, set: hyphenated });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exam: string; set: string }>;
}): Promise<Metadata> {
  const { exam, set: setParam } = await params;
  const set = getQuizSetByExamAndSet(exam, setParam) || getQuizSetBySlug(setParam);

  if (!set) {
    return {
      title: 'Mock Test Not Found | Career Diary',
    };
  }

  const title = `${set.title} 2026 – Free Online Test Series & Practice Set | Career Diary`;
  const description = `${set.subtitle}. Practice ${set.total_questions} questions for ${set.exam} with real-time CBT timer, negative marking (+4 / -1), and bilingual step-by-step solutions on Career Diary.`;
  const url = `https://careerdiary.in${set.urlPath}`;

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

export default async function TestSeriesSetRoute({
  params,
}: {
  params: Promise<{ exam: string; set: string }>;
}) {
  const { exam, set: setParam } = await params;
  const set = getQuizSetByExamAndSet(exam, setParam) || getQuizSetBySlug(setParam);

  if (!set) {
    notFound();
  }

  return <StudyQuizPage initialSlug={set.slug} initialMode="hub" />;
}
