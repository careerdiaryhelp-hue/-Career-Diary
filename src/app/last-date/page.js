import { getAllJobsServer } from '../../utils/jobsService';
import LastDateJobsPage from '../../views/LastDateJobsPage';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Last Date Reminder 2026 – Jobs Closing Today & This Week | Career Diary',
  description: 'Never miss a deadline! Track upcoming last dates for government job online applications, fee payments, and form corrections on Career Diary.',
  alternates: {
    canonical: 'https://careerdiary.in/last-date',
  },
};

export default async function LastDateRoute() {
  const jobs = await getAllJobsServer();
  return (
    <div className="app-root">
      <Header />
      <Navbar />
      <main className="main-content">
        <LastDateJobsPage jobs={jobs} />
      </main>
      <Footer />
    </div>
  );
}
