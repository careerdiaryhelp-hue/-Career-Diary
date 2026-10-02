import { getAllJobsServer } from '../../utils/jobsService';
import { isAdmission } from '../../data/categoryHelpers';
import CategoryPageClient from '../../components/CategoryPageClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Admissions 2026 – University, College & School Entrance Forms | Career Diary',
  description: 'Find all latest admission notices, entrance examination dates, counselling schedules and online application forms on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/admission',
  },
};

export default async function AdmissionCategoryPage() {
  const allJobs = await getAllJobsServer();
  const jobs = allJobs.filter(isAdmission);
  return (
    <CategoryPageClient
      categoryKey="ADMISSION"
      title="Admission Notices 2026"
      subtitle="University, College & School Entrance Exams, Application Links & Prospectus"
      initialJobs={jobs}
    />
  );
}
