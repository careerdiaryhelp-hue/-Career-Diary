import { getAllJobsServer } from '../utils/jobsService';
import { fetchBreakingNewsServer } from '../firebase';
import HomeClient from '../components/HomeClient';

export const revalidate = 600; // Revalidate every 10 minutes (ISR)

export const metadata = {
  title: 'CAREER DIARY • GOVT JOB PORTAL | CareerDiary.in',
  description: 'Career Diary (careerdiary.in) - India\'s most trusted portal for Latest Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.',
  alternates: {
    canonical: 'https://careerdiary.in/',
  },
};

export default async function HomePage() {
  const initialJobs = await getAllJobsServer();
  const initialNews = await fetchBreakingNewsServer();

  return <HomeClient initialJobs={initialJobs} initialNews={initialNews} />;
}
