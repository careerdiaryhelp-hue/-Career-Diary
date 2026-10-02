import { getAllJobsServer } from '../../utils/jobsService';
import TopOnlineFormsPage from '../../views/TopOnlineFormsPage';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Top Online Form 2026 – Apply Online for Latest Vacancies | Career Diary',
  description: 'Check top online application forms, ongoing recruitment processes and direct registration links on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/top-online-forms',
  },
};

export default async function TopOnlineFormsRoute() {
  const allJobs = await getAllJobsServer();
  const jobs = allJobs.filter(j => Boolean(j.isTopForm) && !j.title?.toLowerCase().includes('top online form'));
  return (
    <div className="app-root">
      <Header />
      <Navbar />
      <main className="main-content">
        <TopOnlineFormsPage jobs={jobs} />
      </main>
      <Footer />
    </div>
  );
}
