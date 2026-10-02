import { getAllJobsServer } from '../../utils/jobsService';
import { isAnswerKey } from '../../data/categoryHelpers';
import CategoryPageClient from '../../components/CategoryPageClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Answer Key 2026 – Download Official Keys & Response Sheets | Career Diary',
  description: 'Download official exam answer keys, response sheets and challenge links for various recruitment tests on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/answer-key',
  },
};

export default async function AnswerKeyCategoryPage() {
  const allJobs = await getAllJobsServer();
  const jobs = allJobs.filter(isAnswerKey);
  return (
    <CategoryPageClient
      categoryKey="ANSWER KEY"
      title="Official Answer Keys 2026"
      subtitle="Download Question Papers, Model Answer Keys & Raise Objection Online"
      initialJobs={jobs}
    />
  );
}
