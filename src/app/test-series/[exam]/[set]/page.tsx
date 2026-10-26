import StudyQuizPage from '../../../../views/StudyQuizPage';
import { getQuizSetByExamAndSet, getAllQuizSets, getQuizSetBySlug } from '../../../../data/quizRegistry';
import { fetchTestSeriesBySlug, fetchTestSeriesOnce } from '../../../../firebase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const sets = getAllQuizSets();
  const params: { exam: string; set: string }[] = [];

  for (const s of sets) {
    params.push({ exam: s.examSlug, set: s.setSlug });
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
  let set: any = getQuizSetByExamAndSet(exam, setParam) || getQuizSetBySlug(setParam);

  if (!set) {
    const allDynamic = await fetchTestSeriesOnce();
    const dynamic = (allDynamic || []).find(
      (s: any) => (s.slug === setParam || s.setSlug === setParam || s.id === setParam)
    ) || (await fetchTestSeriesBySlug(setParam));
    if (dynamic) {
      set = {
        ...dynamic,
        title: dynamic.title,
        subtitle: dynamic.description || dynamic.subtitle || `${dynamic.totalQuestions || 150} Questions CBT Mock Test`,
        total_questions: dynamic.totalQuestions || dynamic.total_questions || 150,
        exam: dynamic.exam || 'Govt Exam',
        urlPath: dynamic.urlPath || `/test-series/${exam}/${setParam}`
      };
    }
  }

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
  let set: any = getQuizSetByExamAndSet(exam, setParam) || getQuizSetBySlug(setParam);

  if (!set) {
    const allDynamic = await fetchTestSeriesOnce();
    const dynamic = (allDynamic || []).find(
      (s: any) => (s.slug === setParam || s.setSlug === setParam || s.id === setParam)
    ) || (await fetchTestSeriesBySlug(setParam));
    if (dynamic) {
      set = dynamic;
    }
  }

  if (!set) {
    notFound();
  }

  return <StudyQuizPage initialSlug={set.slug || set.id} initialMode="hub" />;
}
