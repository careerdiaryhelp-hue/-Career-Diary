import { cache } from 'react';
import StudyQuizPage from '../../../../views/StudyQuizPage';
import { getQuizSetByExamAndSet, getAllQuizSets, getQuizSetBySlug } from '../../../../data/quizRegistry';
import { fetchTestSeriesBySlug, fetchTestSeriesOnce } from '../../../../firebase';
import { extractQuestionsFromContent } from '../../../../data/questionExtractor';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 120;

export async function generateStaticParams() {
  const sets = getAllQuizSets();
  const params: { exam: string; set: string }[] = [];

  for (const s of sets) {
    params.push({ exam: s.examSlug, set: s.setSlug });
    const hyphenated = s.setSlug.replace(/^set(\d+)$/, 'set-$1');
    if (hyphenated !== s.setSlug) {
      params.push({ exam: s.examSlug, set: hyphenated });
    }
    const numOnly = s.setSlug.replace(/^set(\d+)$/, '$1');
    if (numOnly !== s.setSlug && numOnly) {
      params.push({ exam: s.examSlug, set: numOnly });
    }
  }

  // Ensure high-priority BSSC routes are statically generated
  params.push({ exam: 'bssc-cgl-4-bso-aso-293', set: 'set12' });
  params.push({ exam: 'bssc-cgl-4-bso-aso-293', set: 'set-12' });
  params.push({ exam: 'bssc-cgl-4-bso-aso-293', set: '12' });

  return params;
}

// Request-scoped memoized fetch to prevent duplicate Firestore requests and Worker CPU/Memory spikes
const getTestSeriesForRoute = cache(async (exam: string, setParam: string) => {
  const cleanExam = String(exam || '').toLowerCase().trim().replace(/_/g, '-');
  const cleanSet = String(setParam || '').toLowerCase().trim().replace(/[-_]/g, '');

  const allDynamic = await fetchTestSeriesOnce();
  let set: any = (allDynamic || []).find((s: any) => {
    const sExam = String(s.examSlug || s.exam || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const sSet = String(s.setSlug || s.set || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const sSlug = String(s.slug || s.id || '').toLowerCase().trim();
    return (
      (sExam === cleanExam && sSet === cleanSet) ||
      (sExam === cleanExam && (cleanSet.endsWith(sSet) || sSet.endsWith(cleanSet))) ||
      ((sExam.includes(cleanExam) || cleanExam.includes(sExam)) && (sSet === cleanSet || cleanSet.includes(sSet))) ||
      sSlug === cleanSet ||
      sSlug === cleanExam ||
      sSlug === `${cleanExam}-${cleanSet}` ||
      sSlug === String(setParam || '').toLowerCase().trim()
    );
  });

  if (!set) {
    set = (await fetchTestSeriesBySlug(setParam)) ||
          (await fetchTestSeriesBySlug(exam)) ||
          (await fetchTestSeriesBySlug(`${cleanExam}-${cleanSet}`)) ||
          (await fetchTestSeriesBySlug('bssc-cgl-4-bso-aso-293-set12'));
  }

  if (set && (!set.questions || set.questions.length <= 3 || set.isChunked)) {
    const fullSet = (await fetchTestSeriesBySlug(set.slug || set.id)) ||
                    (await fetchTestSeriesBySlug(setParam)) ||
                    (await fetchTestSeriesBySlug(exam));
    if (fullSet && Array.isArray(fullSet.questions) && fullSet.questions.length > 0) {
      set = { ...set, ...fullSet };
    }
  }

  if (!set || !set.questions || set.questions.length === 0) {
    const fallbackStatic = getQuizSetByExamAndSet(exam, setParam) ||
                           getQuizSetBySlug(setParam) ||
                           getQuizSetBySlug(exam) ||
                           getQuizSetBySlug(`${cleanExam}-${cleanSet}`) ||
                           getQuizSetBySlug('bssc-cgl-4-bso-aso-293-set12');
    if (fallbackStatic && fallbackStatic.questions && fallbackStatic.questions.length > 0) {
      set = set ? { ...set, questions: fallbackStatic.questions, total_questions: fallbackStatic.questions.length } : fallbackStatic;
    }
  }

  // Pre-extract questions ONLY if set has 0 questions but has content (avoids catastrophic regex on huge content)
  if (set && (!set.questions || set.questions.length === 0) && set.content) {
    try {
      const extracted = extractQuestionsFromContent(set.content);
      if (extracted && extracted.length > 0) {
        set = {
          ...set,
          questions: extracted,
          total_questions: extracted.length
        };
      }
    } catch (_) {}
  }

  // Final safeguard: If set exists but questions are still 0, provide BSSC 150-question bank
  if (set && (!set.questions || set.questions.length === 0)) {
    const bsscFallback = getQuizSetBySlug('bssc-cgl-4-bso-aso-293-set12') || getQuizSetBySlug('bssc-cgl-set-3') || getAllQuizSets()[0];
    if (bsscFallback && bsscFallback.questions && bsscFallback.questions.length > 0) {
      set = {
        ...set,
        questions: bsscFallback.questions,
        total_questions: bsscFallback.questions.length
      };
    }
  }

  // Optimize payload: If questions are already loaded, strip huge raw HTML content string to save Worker RAM and avoid Error 1102
  if (set && Array.isArray(set.questions) && set.questions.length > 0 && set.content && set.content.length > 5000) {
    set = { ...set, content: '' };
  }

  return set;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exam: string; set: string }>;
}): Promise<Metadata> {
  const { exam, set: setParam } = await params;
  const set = await getTestSeriesForRoute(exam, setParam);

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
  searchParams,
}: {
  params: Promise<{ exam: string; set: string }>;
  searchParams?: Promise<{ mode?: string }>;
}) {
  const { exam, set: setParam } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialMode = resolvedSearchParams?.mode === 'test' ? 'test' : 'study';

  const set = await getTestSeriesForRoute(exam, setParam);

  if (!set || !Array.isArray(set.questions) || set.questions.length === 0) {
    notFound();
  }

  return <StudyQuizPage initialSlug={set.slug || set.id} initialSet={set} initialMode={initialMode} />;
}
