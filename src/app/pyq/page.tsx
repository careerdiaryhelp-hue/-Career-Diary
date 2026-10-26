import { fetchPyqOnce } from '../../firebase';
import PyqListingClient from '../../components/PyqListingClient';

export const revalidate = 60; // 60s ISR cache keeps posts fresh while preserving quotas

export const metadata = {
  title: 'Previous Year Question Papers (PYQ) – Solved Papers & CBT Mock Tests | Career Diary',
  description: 'Practice and attempt Previous Year Question Papers (PYQ) with CBT mock test timer, detailed step-by-step solutions, and study mode for SSC, BSSC, Railways RRB, Banking, and State PSC on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/pyq',
  },
  openGraph: {
    title: 'Previous Year Question Papers (PYQ) – Solved Papers & CBT Mock Tests | Career Diary',
    description: 'Practice and attempt Previous Year Question Papers (PYQ) with CBT mock test timer, detailed step-by-step solutions, and study mode for SSC, BSSC, Railways RRB, Banking, and State PSC.',
    url: 'https://careerdiary.in/pyq',
    siteName: 'Career Diary',
    type: 'website',
  },
};

export default async function PyqPage() {
  const posts = await fetchPyqOnce();

  return <PyqListingClient initialPosts={posts || []} />;
}
