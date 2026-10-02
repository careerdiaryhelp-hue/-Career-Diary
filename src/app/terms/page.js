import TermsPage from '../../views/TermsPage';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const revalidate = 120;


export const metadata = {
  title: 'Terms & Conditions | Career Diary',
  description: 'Terms and Conditions and Disclaimer for Career Diary (careerdiary.in).',
  alternates: {
    canonical: 'https://careerdiary.in/terms',
  },
};

export default function TermsRoute() {
  return (
    <div className="app-root">
      <Header />
      <Navbar />
      <main className="main-content">
        <TermsPage />
      </main>
      <Footer />
    </div>
  );
}
