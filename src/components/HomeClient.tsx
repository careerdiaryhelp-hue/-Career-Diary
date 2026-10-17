'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import TopTicker from './TopTicker';
import HighlightsGrid from './HighlightsGrid';
import JobColumnsGrid from './JobColumnsGrid';
import Footer from './Footer';
import PostJobModal from './PostJobModal';
import AgeCalcModal from './AgeCalcModal';
import AdminLoginModal from './AdminLoginModal';
import { DisplayAd } from './AdSenseBanner';
import { mergeAndSortJobs } from '../utils/jobsService';
import { getInitialJobs } from '../data/initialJobs';
import { subscribeToFirestoreJobs, subscribeToBreakingNews, cleanJobId } from '../firebase';
import {
  isResult,
  isAnswerKey,
  isAdmitCard,
  isLatestJob,
  isAdmission,
  isSyllabus,
  isDocument,
  isImportant,
  getSecondaryCategories,
  getJobUrl
} from '../data/categoryHelpers';

export default function HomeClient({ initialJobs = [], initialNews = [] }) {
  const [jobs, setJobs] = useState(initialJobs);

  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentStateFilter, setCurrentStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [breakingNews, setBreakingNews] = useState(initialNews);

  useEffect(() => {
    let active = true;

    // 1. Instant hydration from localStorage/sessionStorage if previously cached
    try {
      const cached = localStorage.getItem('careerdiary_live_jobs') || sessionStorage.getItem('careerdiary_live_jobs');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJobs(prev => mergeAndSortJobs(parsed, prev));
        }
      }
      const cachedNews = localStorage.getItem('careerdiary_breaking_news') || sessionStorage.getItem('careerdiary_breaking_news');
      if (cachedNews) {
        const parsedNews = JSON.parse(cachedNews);
        if (Array.isArray(parsedNews) && parsedNews.length > 0) {
          setBreakingNews(parsedNews);
        }
      }
    } catch (_) {}

    if (!initialJobs || initialJobs.length === 0) {
      getInitialJobs().then(staticJobs => {
        if (active) setJobs(prev => mergeAndSortJobs(prev, staticJobs));
      });
    }

    const isAdminUser = typeof window !== 'undefined' && (
      localStorage.getItem('career_diary_admin') === 'true' ||
      window.location.search.includes('admin')
    );

    // 3-minute client throttle: skip network request if cache is fresh (< 3 mins), protecting Firebase quota
    const lastFetch = Number(localStorage.getItem('careerdiary_live_jobs_ts') || 0);
    const isCacheFresh = (Date.now() - lastFetch) < 180000;

    if (!isCacheFresh || isAdminUser) {
      // 2. Fetch fresh live jobs from /api/jobs for ALL browsers (works in Chrome, Vivo, Samsung, Firefox, Safari)
      fetch('/api/jobs')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(freshPosts => {
          if (active && Array.isArray(freshPosts) && freshPosts.length > 0) {
            try {
              localStorage.setItem('careerdiary_live_jobs', JSON.stringify(freshPosts));
              localStorage.setItem('careerdiary_live_jobs_ts', String(Date.now()));
              sessionStorage.setItem('careerdiary_live_jobs', JSON.stringify(freshPosts));
            } catch (_) {}
            setJobs(prev => mergeAndSortJobs(freshPosts, prev));
          }
        })
        .catch(() => {
          // Fallback: direct REST query from Firestore if API route is unreachable
          import('../firebase').then(({ fetchFirestoreJobsOnce }) => {
            fetchFirestoreJobsOnce().then(freshPosts => {
              if (active && Array.isArray(freshPosts) && freshPosts.length > 0) {
                try {
                  localStorage.setItem('careerdiary_live_jobs', JSON.stringify(freshPosts));
                  localStorage.setItem('careerdiary_live_jobs_ts', String(Date.now()));
                  sessionStorage.setItem('careerdiary_live_jobs', JSON.stringify(freshPosts));
                } catch (_) {}
                setJobs(prev => mergeAndSortJobs(freshPosts, prev));
              }
            }).catch(() => {});
          }).catch(() => {});
        });

      // 3. Fetch fresh breaking news from /api/news for ALL browsers
      fetch('/api/news')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(newsData => {
          if (active && Array.isArray(newsData) && newsData.length > 0) {
            try {
              localStorage.setItem('careerdiary_breaking_news', JSON.stringify(newsData));
              sessionStorage.setItem('careerdiary_breaking_news', JSON.stringify(newsData));
            } catch (_) {}
            setBreakingNews(newsData);
          }
        })
        .catch(() => {
          import('../firebase').then(({ fetchBreakingNewsServer }) => {
            fetchBreakingNewsServer().then(newsData => {
              if (active && Array.isArray(newsData) && newsData.length > 0) {
                setBreakingNews(newsData);
              }
            }).catch(() => {});
          }).catch(() => {});
        });
    }

    // 4. Admin Real-time Listener (for live preview while editing in admin dashboard)
    let unsubNews = null;
    let unsubJobs = null;
    if (isAdminUser) {
      unsubNews = subscribeToBreakingNews((newsData) => {
        if (active && Array.isArray(newsData) && newsData.length > 0) {
          setBreakingNews(newsData);
        }
      });

      unsubJobs = subscribeToFirestoreJobs((firestorePosts) => {
        if (active && Array.isArray(firestorePosts) && firestorePosts.length > 0) {
          try {
            sessionStorage.setItem('careerdiary_live_jobs', JSON.stringify(firestorePosts));
          } catch (_) {}
          setJobs(prev => mergeAndSortJobs(firestorePosts, prev));
        }
      }, (err) => console.warn(err), 150);
    }

    return () => {
      active = false;
      if (typeof unsubNews === 'function') unsubNews();
      if (typeof unsubJobs === 'function') unsubJobs();
    };
  }, [initialJobs]);

  const handleResetFilters = () => {
    setCurrentCategory('all');
    setCurrentStateFilter('all');
    setSearchQuery('');
  };

  // Filter jobs for display
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
      else matchCategory = jobCat === curCat || jobCat.includes(curCat) || curCat.includes(jobCat) || getSecondaryCategories(job).some(s => s.includes(curCat) || curCat.includes(s));
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

  return (
    <div className="app-root">
      {/* Sidebar Ads for Desktop */}
      <div className="side-ad-container side-ad-left">
        <DisplayAd style={{ height: '600px', width: '160px', position: 'sticky', top: '150px' }} />
      </div>
      <div className="side-ad-container side-ad-right">
        <DisplayAd style={{ height: '600px', width: '160px', position: 'sticky', top: '150px' }} />
      </div>

      {/* 1. Main Header with Logo, Search & Language */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={handleResetFilters}
      />

      {/* 2. Navigation Bar */}
      <Navbar
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
        onNavigate={(path) => {
          if (path === '/') handleResetFilters();
          else window.location.href = path;
        }}
      />

      {/* 3. Top Tickers: Last Date Reminder, Latest Update, Current Affairs & Breaking News */}
      <TopTicker
        breakingNews={breakingNews}
        jobs={jobs}
        onSelectJob={(id) => {
          const j = jobs.find(x => x.id === id);
          if (j) window.location.href = getJobUrl(j);
        }}
      />

      {/* Main Content Area */}
      <main className="main-content" style={{ minHeight: '650px' }}>
        {currentCategory === 'all' && !searchQuery && currentStateFilter === 'all' && (
          <HighlightsGrid
            jobs={filteredJobs}
            currentStateFilter={currentStateFilter}
            setCurrentStateFilter={setCurrentStateFilter}
            onSelectJob={(id) => {
              const j = jobs.find(x => x.id === id);
              if (j) window.location.href = getJobUrl(j);
            }}
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

        {/* AdSense Block Ad #1: Display Ad */}
        <div className="container" style={{ marginTop: '12px' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>

        {/* Multi-column Grid */}
        <JobColumnsGrid
          jobs={filteredJobs}
          currentCategory={currentCategory}
          searchQuery={searchQuery}
          onSelectJob={(id) => {
            const j = jobs.find(x => x.id === id);
            if (j) window.location.href = getJobUrl(j);
          }}
          onNavigateCategory={(cat, slug) => {
            if (slug) window.location.href = slug;
            else setCurrentCategory(cat);
          }}
        />

        {/* AdSense Block Ad #2: Display Ad at bottom of content */}
        <div className="container" style={{ margin: '20px auto' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => {
            setShowAdminLogin(false);
            window.location.href = '/admin';
          }}
        />
      )}

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
