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

// Dedicated Category Listing Pages
import AdminDashboardPage from './pages/AdminDashboardPage';

// Static Pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ContactUsPage from './pages/ContactUsPage';

// Firebase Cloud Firestore
import {
  publishJobToFirestore,
  deleteJobFromFirestore,
  subscribeToFirestoreJobs
} from './firebase';

import {
  isResult,
  isAnswerKey,
  isAdmitCard,
  isLatestJob,
  isAdmission,
  isSyllabus,
  isDocument,
  isImportant
} from './data/categoryHelpers';

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Results', subtitle: 'Latest Exam Results 2026 - Check Merit Lists & Cut-Off Marks Online | [Career Diary 2026]', slug: '/results', order: 1, seoTitle: 'Results 2026', seoDescription: 'Download the [Result Pdf] All Result 2026 here. Download," "Direct Link," "Live," "Official." Get the direct link, exam date,...' },
  { id: '2', name: 'Admit Card', subtitle: 'Latest Exams Admit Card 2026 - Download Admit Card ,Exam Date& Online | [Career Diary 2026]', slug: '/admit-card', order: 2, seoTitle: 'Admit Cards 2026', seoDescription: 'Get the latest updates on admit cards and hall tickets. Download your exam call letters for SSC, Banking, Railways, and...' },
  { id: '3', name: 'Latest Jobs', subtitle: 'Latest Job 2026 @Careerdiary', slug: '/latest-jobs', order: 3, seoTitle: 'Latest Jobs 2026', seoDescription: 'Latest Government Jobs, Notifications, Apply Online...' },
  { id: '4', name: 'Answer Key', subtitle: 'Official Answer Keys', slug: '/answer-key', order: 4, seoTitle: 'Answer Key 2026', seoDescription: 'Download official answer keys and response sheets...' },
  { id: '5', name: 'Admission', subtitle: 'Admission Notices', slug: '/admission', order: 5, seoTitle: 'Admissions 2026', seoDescription: 'College, University, and School admissions 2026...' },
  { id: '6', name: 'Syllabus', subtitle: 'Exam Syllabus & Pattern', slug: '/syllabus', order: 6, seoTitle: 'Exam Syllabus 2026', seoDescription: 'Detailed exam syllabus and selection process...' },
];

const DEFAULT_BREAKING_NEWS = [
  // 1. Result (2 Posts)
  { id: '1', category: 'Result', message: 'Bihar BTSC Staff Nurse 2026 Result Out', link: '/bihar-btsc-staff-nurse-2026-result-out', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '2', category: 'Result', message: 'Railway RRB Group D CEN 09/2025 Level 1 Answer Key 2026 Out 🔥', link: '/railway-rrb-group-d-cen-09-2025-level-1-answer-key-2026-out', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },

  // 2. Admit Card (2 Posts)
  { id: '3', category: 'Admit Card', message: 'Railway RRB Group D Level 1 Admit Card 2026 Out', link: '/railway-rrb-group-d-level-1-admit-card-2026-out', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '4', category: 'Admit Card', message: 'Railway RRB ALP Recruitment 2026 CEN 01/2026 Application Status Out', link: '/railway-rrb-alp-recruitment-2026-cen-01-2026-application-status-o', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },

  // 3. Latest Job (2 Posts)
  { id: '5', category: 'Latest Job', message: 'India Post GDS Recruitment 2026', link: '/india-post-gds-recruitment-2026', priority: 0, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '6', category: 'Latest Job', message: 'BPSSC Bihar Police Range Officer of Forest Recruitment 2026 Online Start', link: '/bpssc-bihar-police-range-officer-of-forest-recruitment-2026-online-form-16-post', priority: 0, expiry: '12/31/2026, 11:59:00 PM', active: true },

  // 4. Admission (2 Posts)
  { id: '7', category: 'Admission', message: 'Simultala Awasiya Vidyalaya (SAV) Bihar Class 6 Admission Form 2026 Extended', link: '/simultala-awasiya-vidyalaya-sav-bihar-class-6-admission-form-2026', priority: 2, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '8', category: 'Admission', message: 'BSEB Bihar D.El.Ed Common Application Form 2026', link: '/bseb-bihar-d-el-ed-common-application-form-2026', priority: 2, expiry: '12/31/2026, 11:59:00 PM', active: true },
];

export default function App() {
  const [jobs, setJobs] = useState(() => {
    try {
      // Clear legacy cache so users get the fresh real posts immediately
      localStorage.removeItem('career_diary_jobs');

      const adminPosts = localStorage.getItem('career_diary_admin_posts');
      if (adminPosts) {
        const parsed = JSON.parse(adminPosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_JOBS];
        }
      }
    } catch (e) {
      console.warn('Error reading saved jobs', e);
    }
    return INITIAL_JOBS;
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('admin') === 'secret') return true;
    return localStorage.getItem('career_diary_admin') === 'true';
  });

  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentStateFilter, setCurrentStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [staticPage, setStaticPage] = useState(null);

  // Dynamic Categories and Breaking News
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('career_diary_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (c) =>
              c &&
              !['documents', 'important', 'certificate-verification'].includes((c.slug || '').replace(/^\//, '').toLowerCase()) &&
              !['documents', 'important', 'certificate verification'].includes((c.name || '').toLowerCase())
          );
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (e) {}
    return DEFAULT_CATEGORIES;
  });

  const [breakingNews, setBreakingNews] = useState(() => {
    try {
      const saved = localStorage.getItem('career_diary_breaking_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If legacy 5 items, migrate to the 8 category items (2 Result, 2 Admit, 2 Job, 2 Admission)
          if (parsed.length === 5 && parsed[0]?.id === '1' && parsed[0]?.message?.startsWith('BPSSC')) {
            localStorage.setItem('career_diary_breaking_news', JSON.stringify(DEFAULT_BREAKING_NEWS));
            return DEFAULT_BREAKING_NEWS;
          }
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_BREAKING_NEWS;
  });

  const handleSaveCategories = (newCategories) => {
    setCategories(newCategories);
    try {
      localStorage.setItem('career_diary_categories', JSON.stringify(newCategories));
    } catch (e) {}
  };

  const handleSaveBreakingNews = (newNews) => {
    setBreakingNews(newNews);
    try {
      localStorage.setItem('career_diary_breaking_news', JSON.stringify(newNews));
    } catch (e) {}
  };

  useEffect(() => {
    localStorage.setItem('career_diary_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // URL Routing: Synchronize internal state with browser URL pathname
  const syncRouteFromUrl = () => {
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const cleanPath = rawPath.split('#')[0].split('?')[0].toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const qParam = searchParams.get('q');

    // Admin Route
    if (cleanPath === 'admin' || searchParams.get('admin') === 'true' || searchParams.get('admin') === 'secret') {
      setIsAdminRoute(true);
      setSelectedJobId(null);
      setStaticPage(null);
      document.title = 'Admin Panel | Career Diary';
      return;
    }
    setIsAdminRoute(false);

    // Static Pages
    if (cleanPath === 'privacy-policy' || cleanPath === 'privacy') {
      setStaticPage('privacy');
      setSelectedJobId(null);
      setCurrentCategory('all');
      document.title = 'Privacy Policy | Career Diary';
      return;
    }
    if (cleanPath === 'terms-conditions' || cleanPath === 'terms') {
      setStaticPage('terms');
      setSelectedJobId(null);
      setCurrentCategory('all');
      document.title = 'Terms & Conditions | Career Diary';
      return;
    }
    if (cleanPath === 'contact-us' || cleanPath === 'contact') {
      setStaticPage('contact');
      setSelectedJobId(null);
      setCurrentCategory('all');
      document.title = 'Contact Us | Career Diary';
      return;
    }
    setStaticPage(null);

    // Categories
    if (cleanPath === 'latest-jobs' || cleanPath === 'latest-job') {
      setCurrentCategory('LATEST JOB');
      setSelectedJobId(null);
      setSearchQuery(qParam || '');
      document.title = 'Latest Govt Jobs 2026 | Career Diary';
      return;
    }
    if (cleanPath === 'admit-card' || cleanPath === 'admit-cards') {
      setCurrentCategory('ADMIT CARD');
      setSelectedJobId(null);
      setSearchQuery(qParam || '');
      document.title = 'Admit Cards & Hall Tickets 2026 | Career Diary';
      return;
    }
    if (cleanPath === 'result' || cleanPath === 'results') {
      setCurrentCategory('RESULT');
      setSelectedJobId(null);
      setSearchQuery(qParam || '');
      document.title = 'Latest Exam Results 2026 | Career Diary';
      return;
    }
    if (cleanPath === 'answer-key' || cleanPath === 'answer-keys' || cleanPath === 'anskey') {
      setCurrentCategory('ANSWER KEY');
      setSelectedJobId(null);
      setSearchQuery(qParam || '');
      document.title = 'Official Answer Keys 2026 | Career Diary';
      return;
    }
    if (cleanPath === 'syllabus') {
      setCurrentCategory('SYLLABUS');
      setSelectedJobId(null);
      setSearchQuery(qParam || '');
      document.title = 'Exam Pattern & Syllabus 2026 | Career Diary';
      return;
    }
    if (cleanPath === 'admission' || cleanPath === 'admissions') {
      setCurrentCategory('ADMISSION');
      setSelectedJobId(null);
      setSearchQuery(qParam || '');
      document.title = 'College & University Admissions 2026 | Career Diary';
      return;
    }
    if (cleanPath === 'documents' || cleanPath === 'document' || cleanPath === 'certificate-verification' || cleanPath === 'important' || cleanPath === 'important-links') {
      setCurrentCategory('all');
      setSelectedJobId(null);
      navigateTo('/', true);
      return;
    }

    // Popular Exam / Tag Slugs (e.g. /rrb, /ssc, /bpsc, /upsc, /bihar-police, /bank)
    if (cleanPath === 'rrb' || cleanPath === 'railway' || cleanPath === 'railways') {
      setCurrentCategory('all');
      setSearchQuery('RRB');
      setSelectedJobId(null);
      document.title = 'Railway RRB Recruitment, Admit Card & Results | Career Diary';
      return;
    }
    if (cleanPath === 'ssc') {
      setCurrentCategory('all');
      setSearchQuery('SSC');
      setSelectedJobId(null);
      document.title = 'SSC CGL, CHSL, GD, MTS Recruitment | Career Diary';
      return;
    }
    if (cleanPath === 'bpsc') {
      setCurrentCategory('all');
      setSearchQuery('BPSC');
      setSelectedJobId(null);
      document.title = 'Bihar BPSC TRE, CCE Recruitment | Career Diary';
      return;
    }
    if (cleanPath === 'upsc') {
      setCurrentCategory('all');
      setSearchQuery('UPSC');
      setSelectedJobId(null);
      document.title = 'UPSC Civil Services & Engineering Notifications | Career Diary';
      return;
    }
    if (cleanPath === 'bihar-police' || cleanPath === 'police') {
      setCurrentCategory('all');
      setSearchQuery('Bihar Police');
      setSelectedJobId(null);
      document.title = 'Bihar Police Constable & SI Recruitment | Career Diary';
      return;
    }
    if (cleanPath === 'bank' || cleanPath === 'ibps' || cleanPath === 'sbi') {
      setCurrentCategory('all');
      setSearchQuery('Bank');
      setSelectedJobId(null);
      document.title = 'Banking Recruitment, IBPS, SBI PO & Clerk | Career Diary';
      return;
    }

    // Home route
    if (!cleanPath || cleanPath === '') {
      setCurrentCategory('all');
      setSelectedJobId(null);
      if (qParam) {
        setSearchQuery(qParam);
      }
      document.title = 'CAREER DIARY - GOVT JOB PORTAL | Latest Jobs, Admit Card, Results';
      return;
    }

    // Post slug match (e.g. /railway-rrb-group-d-... or /india-post-gds-recruitment-2026)
    let slug = cleanPath;
    if (slug.startsWith('post/')) slug = slug.substring(5);
    if (slug.startsWith('job/')) slug = slug.substring(4);

    let matched = jobs.find(j => j && j.id && j.id.toLowerCase() === slug);
    if (!matched) {
      matched = jobs.find(j => j && j.id && (j.id.toLowerCase().includes(slug) || slug.includes(j.id.toLowerCase())));
    }

    if (matched) {
      setSelectedJobId(matched.id);
      document.title = `${matched.title} | Career Diary`;
      return;
    }

    // Default fallback to home
    setCurrentCategory('all');
    setSelectedJobId(null);
    document.title = 'CAREER DIARY - GOVT JOB PORTAL | Latest Jobs, Admit Card, Results';
  };

  // Navigate to any path with pushState + instant state sync
  const navigateTo = (path, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    syncRouteFromUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync route on mount and when browser back/forward buttons are clicked
  useEffect(() => {
    syncRouteFromUrl();
    const handlePopState = () => {
      syncRouteFromUrl();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [jobs]);

  // Subscribe to real-time Cloud Firestore updates (posts published by Admin go LIVE for all users!)
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreJobs((firestorePosts) => {
      if (Array.isArray(firestorePosts) && firestorePosts.length > 0) {
        setJobs(() => {
          const firestoreIds = new Set(firestorePosts.map((p) => p.id));
          const remainingStatic = INITIAL_JOBS.filter((j) => !firestoreIds.has(j.id));
          return [...firestorePosts, ...remainingStatic];
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Open login page automatically if accessing /admin route while unauthenticated
  useEffect(() => {
    if (isAdminRoute && !isAdmin) {
      setShowAdminLogin(true);
    }
  }, [isAdminRoute, isAdmin]);

  const handleAddJob = async (newJob) => {
    // 1. Instant local optimistic update
    const updated = [newJob, ...jobs.filter(j => j.id !== newJob.id)];
    setJobs(updated);
    try {
      const stored = JSON.parse(localStorage.getItem('career_diary_admin_posts') || '[]');
      localStorage.setItem('career_diary_admin_posts', JSON.stringify([newJob, ...stored.filter(j => j.id !== newJob.id)]));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    // 2. Publish to Firebase Firestore (LIVE for all visitors worldwide!)
    try {
      const res = await publishJobToFirestore(newJob);
      if (res && res.error) {
        throw res.error;
      }
      return { success: true };
    } catch (err) {
      console.error('Firestore publish error:', err);
      return { success: false, error: err };
    }
  };

  const handleDeleteJob = async (id) => {
    setJobs(jobs.filter(j => j.id !== id));
    try {
      const stored = JSON.parse(localStorage.getItem('career_diary_admin_posts') || '[]');
      localStorage.setItem('career_diary_admin_posts', JSON.stringify(stored.filter(j => j.id !== id)));
    } catch (e) {
      console.warn('Failed to delete from localStorage', e);
    }

    // Delete from Firebase Firestore
    try {
      await deleteJobFromFirestore(id);
    } catch (err) {
      console.error('Firestore delete error:', err);
    }
  };

  const handleResetFilters = () => {
    navigateTo('/');
    setCurrentStateFilter('all');
    setSearchQuery('');
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setIsAdminRoute(false);
    localStorage.setItem('career_diary_admin', 'false');
    navigateTo('/');
  };

  const handleBackToAllJobs = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/');
    }
  };

  // Filtered jobs resolver (Drafts excluded from public visitors)
  const filteredJobs = jobs.filter((job) => {
    if (!job || !job.title) return false;
    if (job.status === 'Draft' || job.status === 'draft') return false;
    const titleLower = job.title.toLowerCase().trim();
    if (titleLower.startsWith('test') || titleLower === 'test') return false;

    const jobCat = (job.category || '').toUpperCase();
    const curCat = currentCategory.toUpperCase();

    let matchCategory = currentCategory === 'all';
    if (!matchCategory) {
      if (curCat === 'RESULT') matchCategory = isResult(job);
      else if (curCat === 'ANSWER KEY' || curCat === 'ANSKEY') matchCategory = isAnswerKey(job);
      else if (curCat === 'ADMIT CARD' || curCat === 'ADMIT') matchCategory = isAdmitCard(job);
      else if (curCat === 'LATEST JOB' || curCat === 'JOB' || curCat === 'LATEST JOBS') matchCategory = isLatestJob(job);
      else if (curCat === 'ADMISSION') matchCategory = isAdmission(job);
      else if (curCat === 'SYLLABUS') matchCategory = isSyllabus(job);
      else if (curCat === 'DOCUMENTS' || curCat === 'DOCUMENT' || curCat === 'CERTIFICATE VERIFICATION') matchCategory = isDocument(job);
      else if (curCat === 'IMPORTANT') matchCategory = isImportant(job);
      else matchCategory = jobCat === curCat || jobCat.includes(curCat) || curCat.includes(jobCat);
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
    if ((selectedJob.status === 'Draft' || selectedJob.status === 'draft') && !isAdmin) {
      return (
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#1e293b' }}>Post Not Available</h2>
          <p style={{ color: '#64748b', marginTop: '10px' }}>This post is currently in draft mode and has not yet been published.</p>
          <button className="btn btn-primary" onClick={() => navigateTo('/')} style={{ marginTop: '20px' }}>
            Back to Home
          </button>
        </div>
      );
    }
    return <JobDetailPage job={selectedJob} onBack={handleBackToAllJobs} />;
  };

  const goHome = () => {
    navigateTo('/');
    setShowAdminLogin(false);
  };

  // Helper to render main area when no item is selected
  const renderMainContent = () => {
    // Admin login page (full page, no popup)
    if (showAdminLogin && !isAdmin) return (
      <AdminLoginPage
        onLoginSuccess={() => { setIsAdmin(true); setShowAdminLogin(false); }}
        onCancel={() => { setShowAdminLogin(false); setIsAdminRoute(false); navigateTo('/'); }}
      />
    );

    // Static pages
    if (staticPage === 'privacy') return <PrivacyPolicyPage onBack={goHome} />;
    if (staticPage === 'terms') return <TermsPage onBack={goHome} />;
    if (staticPage === 'contact') return <ContactUsPage onBack={goHome} />;

    if (isAdminRoute && isAdmin) {
      return (
        <AdminDashboardPage
          jobs={jobs}
          onAddJob={handleAddJob}
          onDeleteJob={handleDeleteJob}
          categories={categories}
          onSaveCategories={handleSaveCategories}
          breakingNews={breakingNews}
          onSaveBreakingNews={handleSaveBreakingNews}
          onBack={() => { setIsAdminRoute(false); navigateTo('/'); }}
          onLogout={handleLogoutAdmin}
        />
      );
    }

    return (
      <>
        {currentCategory === 'all' && !searchQuery && currentStateFilter === 'all' && (
          <HighlightsGrid
            jobs={filteredJobs}
            currentStateFilter={currentStateFilter}
            setCurrentStateFilter={setCurrentStateFilter}
            onSelectJob={(id) => navigateTo('/' + id)}
          />
        )}

        {(searchQuery || currentStateFilter !== 'all') && (
          <div className="container" style={{ marginTop: '16px' }}>
            <div className="search-indicator">
              <span>
                Search results for "<strong>{searchQuery || currentStateFilter}</strong>" ({filteredJobs.length} matches)
              </span>
              <button className="btn btn-sm btn-outline" onClick={handleResetFilters}>
                Reset Search
              </button>
            </div>
          </div>
        )}

        <JobColumnsGrid
          jobs={filteredJobs}
          currentCategory={currentCategory}
          searchQuery={searchQuery}
          onSelectJob={(id) => navigateTo('/' + id)}
          onNavigateCategory={(cat, slug) => {
            if (slug) {
              navigateTo(slug);
            } else if (cat === 'all') {
              navigateTo('/');
            } else {
              setCurrentCategory(cat);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </>
    );
  };

  const publishedJobs = jobs.filter(j => j && j.status !== 'Draft' && j.status !== 'draft');

  return (
    <div className="app-root">
      {/* Header with Search */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={isAdmin}
        onOpenPostModal={() => {
          navigateTo('/admin');
          setIsAdminRoute(true);
        }}
        onOpenAdminModal={() => {
          navigateTo('/admin');
          setShowAdminLogin(true);
        }}
        onLogoutAdmin={handleLogoutAdmin}
        onResetFilters={handleResetFilters}
      />

      {/* Navigation Bar */}
      <Navbar
        currentCategory={currentCategory}
        setCurrentCategory={(cat) => {
          setCurrentCategory(cat);
        }}
        onNavigate={(path) => navigateTo(path)}
      />

      {/* Tickers: 1. Last Date Reminder, 2. Breaking News, 3. Latest Update - sequentially after Header */}
      <TopTicker
        jobs={publishedJobs}
        breakingNews={breakingNews}
        onSelectJob={(id) => navigateTo('/' + id)}
      />

      {/* Main View Switcher */}
      {selectedJobId && selectedJob ? renderDetailPage() : renderMainContent()}

      {/* Admin Post Modal */}
      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddJob={handleAddJob}
      />

      <Footer onNavigate={(path) => navigateTo(path)} />

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
