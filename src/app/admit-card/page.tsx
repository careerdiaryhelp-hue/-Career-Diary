import { getAllJobsServer } from '../../utils/jobsService';
import { isAdmitCard } from '../../data/categoryHelpers';
import CategoryPageClient from '../../components/CategoryPageClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Admit Cards 2026 – Download Hall Ticket, Call Letter & Exam Date | Career Diary',
  description: 'Download latest examination admit cards, hall tickets and check exam center city intimation slips on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/admit-card',
  },
};

export default async function AdmitCardCategoryPage() {
  const allJobs = await getAllJobsServer();
  const jobs = allJobs.filter(isAdmitCard);
  return (
    <CategoryPageClient
      categoryKey="ADMIT CARD"
      title="Latest Exam Admit Cards 2026"
      subtitle="Direct links to download Hall Tickets, Call Letters, Exam Shift Timings & Center Details"
      initialJobs={jobs}
    />
  );
}
