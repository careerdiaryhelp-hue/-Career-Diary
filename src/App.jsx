import React, { useState, useEffect } from 'react';
import { INITIAL_JOBS } from './data/initialJobs';
import TopTicker from './components/TopTicker';
import Header from './components/Header';
import Navbar from './components/Navbar';
import HighlightsGrid from './components/HighlightsGrid';
import JobColumnsGrid from './components/JobColumnsGrid';
import PostJobModal from './components/PostJobModal';
import AdminLoginModal from './components/AdminLoginModal';
import Footer from './components/Footer';

// Dedicated Detail Pages
import JobDetailPage from './pages/JobDetailPage';
import AdmitCardDetailPage from './pages/AdmitCardDetailPage';
import ResultDetailPage from './pages/ResultDetailPage';
import AdmissionDetailPage from './pages/AdmissionDetailPage';

// Dedicated Category Listing Pages
import AdmissionsListingPage from './pages/AdmissionsListingPage';

export default function App() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('career_diary_jobs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_JOBS;
      }
    }
    return INITIAL_JOBS;
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('admin') === 'secret') return true;
    return localStorage.getItem('career_diary_admin') === 'true';
  });

  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentStateFilter, setCurrentStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('career_diary_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('career_diary_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Scroll to top when changing page views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedJobId, currentCategory]);

  const handleAddJob = (newJob) => {
    setJobs([newJob, ...jobs]);
  };

  const handleResetFilters = () => {
    setCurrentCategory('all');
    setCurrentStateFilter('all');
    setSearchQuery('');
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.setItem('career_diary_admin', 'false');
  };

  // Filtered jobs resolver
  const filteredJobs = jobs.filter((job) => {
    const matchCategory = currentCategory === 'all' || job.category === currentCategory;
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

  // Helper to render main area when no item is selected
  const renderMainContent = () => {
    if (currentCategory === 'ADMISSION' && !searchQuery && currentStateFilter === 'all') {
      return <AdmissionsListingPage jobs={jobs} onSelectJob={(id) => setSelectedJobId(id)} />;
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
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onResetFilters={handleResetFilters}
      />

      <Navbar
        currentCategory={currentCategory}
        setCurrentCategory={(cat) => {
          setSelectedJobId(null);
          setCurrentCategory(cat);
        }}
      />

      {/* Main View Switcher: Page Detail View OR Category Listing View OR Home Grid View */}
      {selectedJobId && selectedJob ? renderDetailPage() : renderMainContent()}

      {/* Admin Post Modal */}
      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddJob={handleAddJob}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => setIsAdmin(true)}
      />

      <Footer
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onCategorySelect={(cat) => {
          setSelectedJobId(null);
          setCurrentCategory(cat);
        }}
        onSearchSelect={(q) => {
          setSelectedJobId(null);
          setSearchQuery(q);
        }}
      />
    </div>
  );
}
