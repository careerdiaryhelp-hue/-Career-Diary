import { fetchCurrentAffairsOnce } from '../../firebase';
import CurrentAffairsListingClient from '../../components/CurrentAffairsListingClient';

export const revalidate = 60; // 60s ISR cache keeps posts fresh while preserving quotas

export const metadata = {
  title: 'Daily Current Affairs 2026 – Today GK Questions, MCQs & Daily Notes in Hindi | Career Diary',
  description: 'Read daily current affairs questions, monthly GK PDF, and important MCQs with detailed explanations for SSC, BSSC, Railways RRB, Banking, and UPSC on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/current-affairs',
  },
  openGraph: {
    title: 'Daily Current Affairs 2026 – Today GK Questions & Notes | Career Diary',
    description: 'Read daily current affairs questions, monthly GK PDF, and important MCQs with detailed explanations for all competitive exams.',
    url: 'https://careerdiary.in/current-affairs',
    siteName: 'Career Diary',
    type: 'website',
  },
};

export default async function CurrentAffairsPage() {
  const posts = await fetchCurrentAffairsOnce();

  return <CurrentAffairsListingClient initialPosts={posts || []} />;
}
