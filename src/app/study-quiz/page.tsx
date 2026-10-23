import StudyQuizPage from '../../views/StudyQuizPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BSSC CGL Free Online Mock Test & Study Quiz 2026 | 150 Questions CBT Practice - Career Diary',
  description:
    'Free full-length BSSC CGL 150 Questions Mock Test (Set 1) with real-time CBT timer, negative marking (+4 / -1), subject-wise scorecard, and bilingual Hindi & English step-by-step solutions.',
  alternates: {
    canonical: 'https://careerdiary.in/study-quiz',
  },
  openGraph: {
    title: 'BSSC CGL Free Mock Test & Study Portal 2026 | 150 Questions Practice Set',
    description:
      'Practice 150 high-yield questions for BSSC CGL covering General Studies, Reasoning, Science & Maths with full solutions and instant exam simulation.',
    url: 'https://careerdiary.in/study-quiz',
    siteName: 'Career Diary',
    type: 'website',
  },
};

export default function StudyQuizRoute() {
  return <StudyQuizPage initialSlug="bssc-cgl-set-1" initialMode="hub" />;
}
