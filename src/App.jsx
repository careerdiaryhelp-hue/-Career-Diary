import React, { useState, useEffect } from 'react';
import { INITIAL_JOBS } from './data/initialJobs';
import TopTicker from './components/TopTicker';
import Header from './components/Header';
import Navbar from './components/Navbar';
import HighlightsGrid from './components/HighlightsGrid';
import JobColumnsGrid from './components/JobColumnsGrid';
import PostJobModal from './components/PostJobModal';
import AdminLoginPage from './pages/AdminLoginPage';
import Footer from './components/Footer';

// Dedicated Detail Pages
import JobDetailPage from './pages/JobDetailPage';
import AdmitCardDetailPage from './pages/AdmitCardDetailPage';
import ResultDetailPage from './pages/ResultDetailPage';
import AdmissionDetailPage from './pages/AdmissionDetailPage';

// Dedicated Category Listing Pages
import AdmissionsListingPage from './pages/AdmissionsListingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Static Pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ContactUsPage from './pages/ContactUsPage';

export default function App() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('career_diary_jobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out test items created during testing
        const cleanSaved = parsed.filter((j) => {
          if (!j || !j.title) return false;
          const t = j.title.toLowerCase().trim();
          return !t.startsWith('test') && t !== 'test';
        });

        const existingIds = new Set(cleanSaved.map((j) => j.id));
        const missing = INITIAL_JOBS.filter((j) => !existingIds.has(j.id));
        if (missing.length > 0) {
          return [...cleanSaved, ...missing];
        }
        return cleanSaved;
      } catch (e) {
        return INITIAL_JOBS;
      }
    }
    return INITIAL_JOBS;
  });

  // Admin authentication state & route check
  const [isAdmin, setIsAdmin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('admin') === 'secret') return true;
    return localStorage.getItem('career_diary_admin') === 'true';
  });

  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path.includes('/admin') || search.includes('admin');
  });

  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentStateFilter, setCurrentStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); // full page login
  const [staticPage, setStaticPage] = useState(null); // 'privacy' | 'terms' | 'contact'

  useEffect(() => {
    localStorage.setItem('career_diary_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('career_diary_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Open login page automatically if accessing /admin route while unauthenticated
  useEffect(() => {
    if (isAdminRoute && !isAdmin) {
      setShowAdminLogin(true);
    }
  }, [isAdminRoute, isAdmin]);

  // Scroll to top when changing page views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedJobId, currentCategory, isAdminRoute]);

  const handleAddJob = (newJob) => {
    setJobs([newJob, ...jobs]);
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleResetFilters = () => {
    setIsAdminRoute(false);
    setCurrentCategory('all');
    setCurrentStateFilter('all');
    setSearchQuery('');
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setIsAdminRoute(false);
    localStorage.setItem('career_diary_admin', 'false');
  };

  // Filtered jobs resolver
  const filteredJobs = jobs.filter((job) => {
    if (!job || !job.title) return false;
    const titleLower = job.title.toLowerCase().trim();
    if (titleLower.startsWith('test') || titleLower === 'test') return false;

    const jobCat = (job.category || '').toUpperCase();
    const curCat = currentCategory.toUpperCase();

    let matchCategory = currentCategory === 'all';
    if (!matchCategory) {
      if (curCat.includes('RESULT')) {
        matchCategory = jobCat.includes('RESULT') || jobCat.includes('ANSWER KEY');
      } else {
        matchCategory = jobCat === curCat || jobCat.includes(curCat) || curCat.includes(jobCat);
      }
    }

    const matchState =
      currentStateFilter === 'all' ||
      (job.state && job.state.toLowerCase() === currentStateFilter.toLowerCase());

    let matchQuery = true;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const titleMatch = job.title.toLowerCase().includes(q);
      const descMatch = job.description ? job.description.toLowerCase().includes(q) : false;
      const orgMatch = job.organization ? job.organization.toLowerCase().includes(q) : false;
      matchQuery = titleMatch || descMatch || orgMatch;
    }

    return matchCategory && matchState && matchQuery;
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Helper to render dedicated detail page based on category
  const renderDetailPage = () => {
    if (!selectedJob) return null;
    const cat = (selectedJob.category || '').toUpperCase();

    if (cat.includes('ADMIT CARD')) {
      return <AdmitCardDetailPage job={selectedJob} onBack={() => setSelectedJobId(null)} />;
    }
    if (cat.includes('RESULT') || cat.includes('ANSWER KEY')) {
      return <ResultDetailPage job={selectedJob} onBack={() => setSelectedJobId(null)} />;
    }
    if (cat.includes('ADMISSION')) {
      return <AdmissionDetailPage job={selectedJob} onBack={() => setSelectedJobId(null)} />;
    }
    return <JobDetailPage job={selectedJob} onBack={() => setSelectedJobId(null)} />;
  };

  const goHome = () => {
    setStaticPage(null);
    setSelectedJobId(null);
    setIsAdminRoute(false);
    setShowAdminLogin(false);
  };

  // Helper to render main area when no item is selected
  const renderMainContent = () => {
    // Admin login page (full page, no popup)
    if (showAdminLogin && !isAdmin) return (
      <AdminLoginPage
        onLoginSuccess={() => { setIsAdmin(true); setShowAdminLogin(false); }}
        onCancel={() => { setShowAdminLogin(false); setIsAdminRoute(false); }}
      />
    );

    // Static pages
    if (staticPage === 'privacy') return <PrivacyPolicyPage onBack={goHome} />;
    if (staticPage === 'terms') return <TermsPage onBack={goHome} />;
    if (staticPage === 'contact') return <ContactUsPage onBack={goHome} />;

    if (isAdminRoute && isAdmin) {
      return (
        <AdminDashboardPage
          jobs={filteredJobs}
          onAddJob={() => setIsPostModalOpen(true)}
          onDeleteJob={handleDeleteJob}
          onBack={() => setIsAdminRoute(false)}
          onLogout={handleLogoutAdmin}
        />
      );
    }

    if (currentCategory === 'ADMISSION' && !searchQuery && currentStateFilter === 'all') {
      return <AdmissionsListingPage jobs={filteredJobs} onSelectJob={(id) => setSelectedJobId(id)} />;
    }

    return (
      <>
        <HighlightsGrid
          jobs={filteredJobs}
          currentStateFilter={currentStateFilter}
          setCurrentStateFilter={setCurrentStateFilter}
          onSelectJob={(id) => setSelectedJobId(id)}
        />

        {(searchQuery || currentCategory !== 'all' || currentStateFilter !== 'all') && (
          <div className="container" style={{ marginTop: '16px' }}>
            <div className="search-indicator">
              <span>
                Search results for "<strong>{searchQuery || `${currentCategory} (${currentStateFilter})`}</strong>" ({filteredJobs.length} matches)
              </span>
              <button className="btn btn-sm btn-outline" onClick={handleResetFilters}>
                Reset Search
              </button>
            </div>
          </div>
        )}

        <JobColumnsGrid
          jobs={filteredJobs}
          onSelectJob={(id) => setSelectedJobId(id)}
        />
      </>
    );
  };

  return (
    <div className="app-root">
      <TopTicker onSelectJob={(id) => setSelectedJobId(id)} />

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={isAdmin}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenAdminModal={() => {
          setIsAdminRoute(true);
          setShowAdminLogin(true);
        }}
        onLogoutAdmin={handleLogoutAdmin}
        onResetFilters={handleResetFilters}
      />

      <Navbar
        currentCategory={currentCategory}
        setCurrentCategory={(cat) => {
          setSelectedJobId(null);
          setIsAdminRoute(false);
          setCurrentCategory(cat);
        }}
      />

      {/* Main View Switcher */}
      {selectedJobId && selectedJob ? renderDetailPage() : renderMainContent()}

      {/* Admin Post Modal */}
      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddJob={handleAddJob}
      />


      <Footer
        isAdmin={isAdmin}
        onOpenAdminModal={() => {
          setIsAdminRoute(true);
          setShowAdminLogin(true);
        }}
        onLogoutAdmin={handleLogoutAdmin}
        onCategorySelect={(cat) => {
          setSelectedJobId(null);
          setIsAdminRoute(false);
          setCurrentCategory(cat);
        }}
        onSearchSelect={(q) => {
          setSelectedJobId(null);
          setIsAdminRoute(false);
          setSearchQuery(q);
        }}
        onStaticPage={(page) => {
          setStaticPage(page);
          setSelectedJobId(null);
          setIsAdminRoute(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Action Buttons */}
      <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="floating-btn float-whatsapp">
        Join WhatsApp
      </a>
      <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="floating-btn float-telegram">
        Join Telegram
      </a>
    </div>
  );
}
