import bsscSet1Json from './quiz/bssc-cgl-set-1.json';
import bsscSet2Json from './quiz/bssc-cgl-set-2.json';

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
}

export interface QuizSet {
  id: string;
  slug: string;
  exam: string;
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
  topicsSummary: { [topic: string]: number };
  questions: Question[];
}

export const QUIZ_SETS: QuizSet[] = [
  {
    id: 'bssc-cgl-set-1',
    slug: 'bssc-cgl-set-1',
    exam: 'BSSC CGL',
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
  }
];

export function getQuizSetBySlug(slug: string): QuizSet | undefined {
  const clean = String(slug || '').toLowerCase().trim();
  return QUIZ_SETS.find(s => s.slug.toLowerCase() === clean || s.id.toLowerCase() === clean);
}

export function getAllQuizSets(): QuizSet[] {
  return QUIZ_SETS;
}
