import bsscSet1Json from './quiz/bssc-cgl-set-1.json';
import bsscSet2Json from './quiz/bssc-cgl-set-2.json';
import bsscSet3Json from './quiz/bssc-cgl-set-3.json';

export interface Question {
  id: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    [key: string]: string;
  };
  correct_answer: string;
  solution: string;
  image?: string;
  images?: string[];
  explanation_image?: string;
  explanation_images?: string[];
}

export interface QuizSet {
  id: string;
  slug: string;
  exam: string;
  examSlug: string;
  setSlug: string;
  urlPath: string;
  subject: string;
  title: string;
  subtitle: string;
  description: string;
  total_questions: number;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarks: number;
  totalMarks: number;
  category: string;
  badge?: string;
  content?: string;
  topicsSummary: { [topic: string]: number };
  questions: Question[];
}

export const QUIZ_SETS: QuizSet[] = [
  {
    id: 'bssc-cgl-set-1',
    slug: 'bssc-cgl-set-1',
    exam: 'BSSC CGL',
    examSlug: 'bssc-cgl',
    setSlug: 'set1',
    urlPath: '/test-series/bssc-cgl/set1',
    subject: 'Practice Set 1',
    title: 'BSSC CGL Full Mock Test (Set 1)',
    subtitle: '150 Questions • Full Syllabus • Negative Marking • Official Pattern',
    description: 'Complete full-length practice mock test for Bihar Staff Selection Commission Combined Graduate Level (BSSC CGL) examination. Features 150 high-yield questions covering General Studies (50), General Science (25), Mathematics (25), and Reasoning (50) with step-by-step Hindi & English solutions.',
    total_questions: bsscSet1Json.questions.length,
    durationMinutes: 135,
    marksPerQuestion: 4,
    negativeMarks: 1,
    totalMarks: bsscSet1Json.questions.length * 4,
    category: 'BIHAR GOVT EXAMS',
    badge: 'Popular Full Mock',
    topicsSummary: {
      'General Studies': 50,
      'Reasoning': 50,
      'General Science': 25,
      'Mathematics': 25
    },
    questions: bsscSet1Json.questions as Question[]
  },
  {
    id: 'bssc-cgl-set-2',
    slug: 'bssc-cgl-set-2',
    exam: 'BSSC CGL',
    examSlug: 'bssc-cgl',
    setSlug: 'set2',
    urlPath: '/test-series/bssc-cgl/set2',
    subject: 'Practice Set 2',
    title: 'BSSC CGL Full Mock Test (Set 2)',
    subtitle: '150 Questions • Full Syllabus • Negative Marking • Official Pattern',
    description: 'Complete full-length practice mock test 2 for Bihar Staff Selection Commission Combined Graduate Level (BSSC CGL) examination. Features 150 high-yield questions covering General Studies (50), General Science (25), Mathematics (25), and Mental Ability / Reasoning (50) with step-by-step Hindi & English solutions.',
    total_questions: bsscSet2Json.questions.length,
    durationMinutes: 135,
    marksPerQuestion: 4,
    negativeMarks: 1,
    totalMarks: bsscSet2Json.questions.length * 4,
    category: 'BIHAR GOVT EXAMS',
    badge: 'New Set 2 Live',
    topicsSummary: {
      'General Studies': 50,
      'Mental Ability': 50,
      'General Science': 25,
      'Mathematics': 25
    },
    questions: bsscSet2Json.questions as Question[]
  },
  {
    id: 'bssc-cgl-set-3',
    slug: 'bssc-cgl-set-3',
    exam: 'BSSC CGL-4',
    examSlug: 'bssc-cgl',
    setSlug: 'set3',
    urlPath: '/test-series/bssc-cgl/set3',
    subject: 'Edu Teria Vol-1 (Set 1)',
    title: 'BSSC CGL-4 मॉडल प्रैक्टिस सेट - SET 01 (EDU TERIA)',
    subtitle: '150 Questions • Full Syllabus • Negative Marking • Official Pattern & Detailed Solution',
    description: 'BSSC CGL-4 प्रारंभिक परीक्षा 2026 हेतु EDU TERIA Volume-1 का सम्पूर्ण 150 प्रश्नों का मॉडल प्रैक्टिस सेट-1। इसमें सामान्य अध्ययन (50), सामान्य विज्ञान (25), गणित (25), और तर्कशक्ति (50) के प्रश्न विस्तृत व्याख्या और आरेखों सहित शामिल हैं।',
    total_questions: bsscSet3Json.questions.length,
    durationMinutes: 135,
    marksPerQuestion: 4,
    negativeMarks: 1,
    totalMarks: bsscSet3Json.questions.length * 4,
    category: 'BIHAR GOVT EXAMS',
    badge: 'Edu Teria Vol-1 Live',
    topicsSummary: {
      'General Studies': 50,
      'Reasoning': 50,
      'General Science': 25,
      'Mathematics': 25
    },
    questions: bsscSet3Json.questions as Question[]
  }
];

export function getQuizSetByExamAndSet(examSlug: string, setSlug: string): QuizSet | undefined {
  const cleanExam = String(examSlug || '').toLowerCase().trim().replace(/_/g, '-');
  const cleanSet = String(setSlug || '').toLowerCase().trim().replace(/[-_]/g, '');

  return QUIZ_SETS.find(s => {
    const sExam = s.examSlug.toLowerCase().replace(/_/g, '-');
    const sSet = s.setSlug.toLowerCase().replace(/[-_]/g, '');
    if (sExam === cleanExam && sSet === cleanSet) return true;

    // Support bssc-cgl-4 aliases
    if ((cleanExam === 'bssc-cgl4' || cleanExam === 'bssc-cgl-4') && (cleanSet === 'set1' || cleanSet === 'set01') && s.id === 'bssc-cgl-set-3') {
      return true;
    }
    // Support eduteria-set1 alias
    if (sExam === cleanExam && (cleanSet === 'eduteriaset1' || cleanSet === 'bssccgl4set1') && s.id === 'bssc-cgl-set-3') {
      return true;
    }

    return false;
  });
}

export function getQuizSetsByExam(examSlug: string): QuizSet[] {
  const cleanExam = String(examSlug || '').toLowerCase().trim().replace(/_/g, '-');
  if (cleanExam === 'bssc-cgl4' || cleanExam === 'bssc-cgl-4') {
    return QUIZ_SETS.filter(s => s.examSlug === 'bssc-cgl' || s.exam.includes('CGL-4'));
  }
  return QUIZ_SETS.filter(s => s.examSlug.toLowerCase().replace(/_/g, '-') === cleanExam);
}

export function getAllExamSlugs(): string[] {
  const set = new Set<string>();
  QUIZ_SETS.forEach(s => set.add(s.examSlug));
  set.add('bssc-cgl4');
  return Array.from(set);
}

export function getQuizSetBySlug(slug: string): QuizSet | undefined {
  const clean = String(slug || '').toLowerCase().trim();
  const direct = QUIZ_SETS.find(s => s.slug.toLowerCase() === clean || s.id.toLowerCase() === clean);
  if (direct) return direct;

  const norm = clean.replace(/[-_]/g, '');
  const bySet = QUIZ_SETS.find(s => s.setSlug.toLowerCase().replace(/[-_]/g, '') === norm);
  if (bySet) return bySet;

  if (norm === 'bssccgl4set1' || norm === 'eduteriaset1' || norm === 'bssccgleduteriaset1') {
    return QUIZ_SETS.find(s => s.id === 'bssc-cgl-set-3');
  }

  return undefined;
}

export function getAllQuizSets(): QuizSet[] {
  return QUIZ_SETS;
}
