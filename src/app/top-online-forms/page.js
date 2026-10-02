import { getAllJobsServer } from '../../utils/jobsService';
import { fetchTopOnlineFormsServer } from '../../firebase';
import TopOnlineFormsClient from '../../components/TopOnlineFormsClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Top Online Form 2026 – Apply Online for Latest Vacancies | Career Diary',
  description: 'Check top online application forms, ongoing recruitment processes and direct registration links on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/top-online-forms',
  },
};

export default async function TopOnlineFormsRoute() {
  const [topForms, allJobs] = await Promise.all([
    fetchTopOnlineFormsServer(),
    getAllJobsServer(),
  ]);

  return (
    <TopOnlineFormsClient
      initialJobs={topForms}
      fallbackJobs={allJobs}
    />
  );
}

