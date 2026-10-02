import { getAllJobsServer } from '../../utils/jobsService';
import { isResult, isAnswerKey, isAdmitCard } from '../../data/categoryHelpers';
import LastDateClient from '../../components/LastDateClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Last Date Reminder 2026 – Jobs Closing Today & This Week | Career Diary',
  description: 'Never miss a deadline! Track upcoming last dates for government job online applications, fee payments, and form corrections on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/last-date',
  },
};

export default async function LastDateRoute() {
  const allJobs = await getAllJobsServer();
  const jobs = allJobs.filter(j => !isResult(j) && !isAnswerKey(j) && !isAdmitCard(j));
  return <LastDateClient jobs={jobs} />;
}
