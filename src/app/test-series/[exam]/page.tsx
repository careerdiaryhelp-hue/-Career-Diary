import StudyQuizPage from '../../../views/StudyQuizPage';
import { getAllExamSlugs, getQuizSetsByExam } from '../../../data/quizRegistry';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const exams = getAllExamSlugs();
  return exams.map((exam) => ({ exam }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exam: string }>;
}): Promise<Metadata> {
  const { exam } = await params;
  const sets = getQuizSetsByExam(exam);

  if (sets.length === 0) {
    return {
      title: 'Exam Not Found | Career Diary',
    };
  }

  const examName = sets[0].exam;
  const title = `${examName} Free Online Test Series & Mock Tests 2026 | Full Syllabus Practice - Career Diary`;
  const description = `Practice free online mock tests for ${examName}. Full-length 150 questions practice sets with real-time CBT timer, negative marking, scorecard and step-by-step Hindi/English solutions.`;
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
}: {
  params: Promise<{ exam: string }>;
}) {
  const { exam } = await params;
  const sets = getQuizSetsByExam(exam);

  if (sets.length === 0) {
    notFound();
  }

  return <StudyQuizPage initialSlug={sets[0].slug} initialMode="hub" />;
}
