import { getAllJobsServer } from '../../utils/jobsService';
import CategoryPageClient from '../../components/CategoryPageClient';

export const revalidate = 120;


export const metadata = {
  title: 'Results 2026 – Check Exam Results, Scorecards & Merit Lists | Career Diary',
  description: 'Check latest exam results, merit lists, scorecard download links and category-wise cut off marks on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/results',
  },
};

export default async function ResultsCategoryPage() {
  const jobs = await getAllJobsServer();
  return (
    <CategoryPageClient
      categoryKey="RESULT"
      title="Latest Exam Results 2026"
      subtitle="Check Scorecards, Merit Lists, Qualified Candidates PDF & Official Cut-Off Marks"
      initialJobs={jobs}
    />
  );
}
