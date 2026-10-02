import { getAllJobsServer } from '../../utils/jobsService';
import { isSyllabus } from '../../data/categoryHelpers';
import CategoryPageClient from '../../components/CategoryPageClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Exam Syllabus 2026 – Download Detailed Exam Pattern & Syllabus PDF | Career Diary',
  description: 'Download subject-wise exam syllabus, marking scheme and selection process PDF for all upcoming exams on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/syllabus',
  },
};

export default async function SyllabusCategoryPage() {
  const allJobs = await getAllJobsServer();
  const jobs = allJobs.filter(isSyllabus);
  return (
    <CategoryPageClient
      categoryKey="SYLLABUS"
      title="Examination Syllabus & Patterns 2026"
      subtitle="Subject-wise Topics, Negative Marking Scheme & Complete Selection Process"
      initialJobs={jobs}
    />
  );
}
