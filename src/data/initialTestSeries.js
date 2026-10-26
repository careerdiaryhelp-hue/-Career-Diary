import bsscSet1Json from './quiz/bssc-cgl-set-1.json';
import bsscSet2Json from './quiz/bssc-cgl-set-2.json';

export const initialTestSeries = [
  {
    id: 'bssc-cgl-set-1',
    slug: 'bssc-cgl-set-1',
    title: 'BSSC CGL Full Mock Test (Set 1)',
    exam: 'BSSC CGL',
    set: 'Set 1',
    category: 'BIHAR GOVT EXAMS',
    subject: 'Full Syllabus Practice Set',
    description: 'Complete full-length practice mock test for BSSC CGL examination with 150 questions, CBT timer, negative marking (+4 / -1), and detailed solutions.',
    durationMinutes: 135,
    marksPerQuestion: 4,
    negativeMarks: 1,
    totalQuestions: bsscSet1Json.questions.length,
    status: 'Published',
    postDate: '26 October 2026 | 08:00 AM',
    date: '26 October 2026',
    views: 3450,
    badge: 'Popular Full Mock',
    questions: bsscSet1Json.questions,
    updatedAt: '2026-10-26T08:00:00.000Z'
  },
  {
    id: 'bssc-cgl-set-2',
    slug: 'bssc-cgl-set-2',
    title: 'BSSC CGL Full Mock Test (Set 2)',
    exam: 'BSSC CGL',
    set: 'Set 2',
    category: 'BIHAR GOVT EXAMS',
    subject: 'Full Syllabus Practice Set',
    description: 'Complete full-length practice mock test 2 for BSSC CGL examination with 150 questions covering GS, Science, Maths, and Reasoning.',
    durationMinutes: 135,
    marksPerQuestion: 4,
    negativeMarks: 1,
    totalQuestions: bsscSet2Json.questions.length,
    status: 'Published',
    postDate: '26 October 2026 | 08:30 AM',
    date: '26 October 2026',
    views: 2980,
    badge: 'New Set 2 Live',
    questions: bsscSet2Json.questions,
    updatedAt: '2026-10-26T08:30:00.000Z'
  }
];
