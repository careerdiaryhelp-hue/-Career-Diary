import { cache } from 'react';
import StudyQuizPage from '../../../views/StudyQuizPage';
import { getAllExamSlugs, getQuizSetsByExam } from '../../../data/quizRegistry';
import { fetchTestSeriesOnce } from '../../../firebase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 120;

export async function generateStaticParams() {
  const exams = getAllExamSlugs();
  return exams.map((exam) => ({ exam }));
}

const getSetsForExam = cache(async (exam: string) => {
  const clean = String(exam || '').toLowerCase().replace(/_/g, '-');
  const allDynamic = await fetchTestSeriesOnce();
  const dynamicForExam = (allDynamic || []).filter(
    (s: any) =>
      (s.examSlug && s.examSlug.toLowerCase().replace(/_/g, '-') === clean) ||
      (s.exam && s.exam.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean)
  );
  const staticSets = getQuizSetsByExam(exam);
  const dynamicIds = new Set(dynamicForExam.map((s: any) => s.slug || s.id));
  const rawSets = [
    ...dynamicForExam,
    ...staticSets.filter((s: any) => !dynamicIds.has(s.slug) && !dynamicIds.has(s.id))
  ];

  // Strip massive raw content strings from summary list to keep Worker memory lightweight
  return rawSets.map(s => (s && s.content && s.content.length > 5000 ? { ...s, content: '' } : s));
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exam: string }>;
}): Promise<Metadata> {
  const { exam } = await params;
  const sets = await getSetsForExam(exam);

  if (sets.length === 0) {
    return {
      title: 'Exam Not Found | Career Diary',
    };
  }

  const examName = sets[0].exam || 'Govt Exam';
  const title = `${examName} Free Online Test Series & Mock Tests 2026 | Full Syllabus Practice - Career Diary`;
  const description = `Practice free online mock tests for ${examName}. Full-length practice sets with real-time CBT timer, negative marking, scorecard and step-by-step Hindi/English solutions.`;
  const url = `https://careerdiary.in/test-series/${exam}`;

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

export default async function TestSeriesExamRoute({
  params,
  searchParams,
}: {
  params: Promise<{ exam: string }>;
  searchParams?: Promise<{ mode?: string }>;
}) {
  const { exam } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialMode = resolvedSearchParams?.mode === 'test' ? 'test' : (resolvedSearchParams?.mode === 'study' ? 'study' : 'hub');

  const sets = await getSetsForExam(exam);

  if (sets.length === 0) {
    notFound();
  }

  return <StudyQuizPage initialSlug={sets[0].slug || sets[0].id} initialSet={sets[0]} initialMode={initialMode} />;
}
