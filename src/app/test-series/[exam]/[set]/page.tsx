import StudyQuizPage from '../../../../views/StudyQuizPage';
import { getQuizSetByExamAndSet, getAllQuizSets, getQuizSetBySlug } from '../../../../data/quizRegistry';
import { fetchTestSeriesBySlug, fetchTestSeriesOnce } from '../../../../firebase';
import { extractQuestionsFromContent } from '../../../../data/questionExtractor';
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
  const cleanExam = String(exam || '').toLowerCase().trim().replace(/_/g, '-');
  const cleanSet = String(setParam || '').toLowerCase().trim().replace(/[-_]/g, '');

  const allDynamic = await fetchTestSeriesOnce();
  let set: any = (allDynamic || []).find((s: any) => {
    const sExam = String(s.examSlug || s.exam || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const sSet = String(s.setSlug || s.set || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const sSlug = String(s.slug || s.id || '').toLowerCase().trim();
    return (sExam === cleanExam && sSet === cleanSet) || sSlug === cleanSet || sSlug === String(setParam || '').toLowerCase().trim();
  }) || (await fetchTestSeriesBySlug(setParam));

  if (!set) {
    set = getQuizSetByExamAndSet(exam, setParam) || getQuizSetBySlug(setParam);
  }

  if (!set) {
    return {
      title: 'Mock Test Not Found | Career Diary',
    };
  }

  const qCount = Array.isArray(set.questions) && set.questions.length > 0
    ? set.questions.length
    : (set.totalQuestions || set.total_questions || 150);

  const title = `${set.title} 2026 – Free Online Test Series & Practice Set | Career Diary`;
  const description = `${set.subtitle || set.description || `${qCount} Questions CBT Mock Test`}. Practice ${qCount} questions for ${set.exam || 'Govt Exam'} with real-time CBT timer, negative marking (+4 / -1), and bilingual step-by-step solutions on Career Diary.`;
  const url = `https://careerdiary.in${set.urlPath || `/test-series/${exam}/${setParam}`}`;

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
  const cleanExam = String(exam || '').toLowerCase().trim().replace(/_/g, '-');
  const cleanSet = String(setParam || '').toLowerCase().trim().replace(/[-_]/g, '');

  // 1. Check dynamic test series from Firestore first so admin updates take effect immediately
  const allDynamic = await fetchTestSeriesOnce();
  let set: any = (allDynamic || []).find((s: any) => {
    const sExam = String(s.examSlug || s.exam || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const sSet = String(s.setSlug || s.set || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const sSlug = String(s.slug || s.id || '').toLowerCase().trim();
    return (sExam === cleanExam && sSet === cleanSet) || sSlug === cleanSet || sSlug === String(setParam || '').toLowerCase().trim();
  }) || (await fetchTestSeriesBySlug(setParam));

  // 2. Fallback to hardcoded sets if not found in Firestore
  if (!set) {
    set = getQuizSetByExamAndSet(exam, setParam) || getQuizSetBySlug(setParam);
  }

  if (!set) {
    notFound();
  }

  // Pre-extract questions on the server if Firestore questions had empty options/solution
  if (set && set.content) {
    const questionsHaveNoOptions = !set.questions || set.questions.length === 0 || !set.questions[0]?.options?.A;
    if (questionsHaveNoOptions) {
      const extracted = extractQuestionsFromContent(set.content);
      if (extracted && extracted.length > 0) {
        set = {
          ...set,
          questions: extracted
        };
      }
    }
  }

  return <StudyQuizPage initialSlug={set.slug || set.id} initialSet={set} initialMode="study" />;
}
