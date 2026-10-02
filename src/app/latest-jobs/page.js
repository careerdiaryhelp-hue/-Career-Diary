import { getAllJobsServer } from '../../utils/jobsService';
import CategoryPageClient from '../../components/CategoryPageClient';

export const revalidate = 60;


export const metadata = {
  title: 'Latest Jobs 2026 – Apply Online for Central & State Govt Jobs | Career Diary',
  description: 'Find all latest government job notifications 2026 for SSC, Banking, Railways, UPSC, Police, Defence, Teaching and State PSC on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/latest-jobs',
  },
};

export default async function LatestJobsPage() {
  const jobs = await getAllJobsServer();
  return (
    <CategoryPageClient
      categoryKey="LATEST JOB"
      title="Latest Government Jobs 2026"
      subtitle="Find all ongoing Central & State Govt Recruitment Notifications, Online Application Links & Eligibility Criteria"
      initialJobs={jobs}
    />
  );
}
