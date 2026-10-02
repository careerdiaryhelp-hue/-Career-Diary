import PrivacyPolicyPage from '../../views/PrivacyPolicyPage';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const revalidate = 600;


export const metadata = {
  title: 'Privacy Policy | Career Diary',
  description: 'Privacy Policy of Career Diary (careerdiary.in). Learn how we handle cookies, Google AdSense, analytics, and your privacy.',
  alternates: {
    canonical: 'https://careerdiary.in/privacy-policy',
  },
};

export default function PrivacyPolicyRoute() {
  return (
    <div className="app-root">
      <Header />
      <Navbar />
      <main className="main-content">
        <PrivacyPolicyPage />
      </main>
      <Footer />
    </div>
  );
}
