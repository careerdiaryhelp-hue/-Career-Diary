import { getAllJobsServer } from '../../utils/jobsService';
import CategoryPageClient from '../../components/CategoryPageClient';

export const revalidate = 120;


export const metadata = {
  title: 'Answer Key 2026 – Download Official Keys & Response Sheets | Career Diary',
  description: 'Download official exam answer keys, response sheets and challenge links for various recruitment tests on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/answer-key',
  },
};

export default async function AnswerKeyCategoryPage() {
  const jobs = await getAllJobsServer();
  return (
    <CategoryPageClient
      categoryKey="ANSWER KEY"
      title="Official Answer Keys 2026"
      subtitle="Download Question Papers, Model Answer Keys & Raise Objection Online"
      initialJobs={jobs}
    />
  );
}
