import StudyQuizPage from '../../views/StudyQuizPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online Test Series & Mock Tests 2026 | BSSC CGL, Bihar & Central Govt Exams - Career Diary',
  description:
    'Prepare for Bihar and Central Govt examinations with Career Diary Free Online Test Series. Full-length mock tests with real-time CBT exam timer, negative marking, instant scorecards, and bilingual Hindi & English solutions.',
  alternates: {
    canonical: 'https://careerdiary.in/test-series',
  },
  openGraph: {
    title: 'Free Online Test Series & Mock Tests 2026 | CBT Exam Practice - Career Diary',
    description:
      'Practice 150 questions full-length CBT mock tests for BSSC CGL and Bihar Govt exams with instant evaluation, ranking, and detailed solutions.',
    url: 'https://careerdiary.in/test-series',
    siteName: 'Career Diary',
    type: 'website',
  },
};

export default function TestSeriesIndexRoute() {
  return <StudyQuizPage initialSlug="bssc-cgl-set-1" initialMode="hub" />;
}
