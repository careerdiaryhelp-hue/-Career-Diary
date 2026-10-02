import ContactUsPage from '../../views/ContactUsPage';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const revalidate = 600;


export const metadata = {
  title: 'Contact Us | Career Diary',
  description: 'Contact Career Diary for queries, feedback, advertising, or support.',
  alternates: {
    canonical: 'https://careerdiary.in/contact-us',
  },
};

export default function ContactUsRoute() {
  return (
    <div className="app-root">
      <Header />
      <Navbar />
      <main className="main-content">
        <ContactUsPage />
      </main>
      <Footer />
    </div>
  );
}
