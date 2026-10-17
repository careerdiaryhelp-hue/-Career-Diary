'use client';
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import LastDateJobsPage from '../views/LastDateJobsPage';
import { getJobUrl } from '../data/categoryHelpers';
import { subscribeToFirestoreJobs } from '../firebase';
import { mergeAndSortJobs } from '../utils/jobsService';

export default function LastDateClient({ jobs: initialJobs = [] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');

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
    } catch (_) {}

    const isAdminUser = typeof window !== 'undefined' && (
      localStorage.getItem('career_diary_admin') === 'true' ||
      window.location.search.includes('admin')
    );

    // 3-minute client throttle: skip network request if cache is fresh (< 3 mins), protecting Firebase quota
    const lastFetch = Number(localStorage.getItem('careerdiary_live_jobs_ts') || 0);
    const isCacheFresh = (Date.now() - lastFetch) < 180000;

    if (!isCacheFresh || isAdminUser) {
      // 2. Fetch fresh live jobs from /api/jobs for ALL browsers
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
    }

    let unsub = null;
    if (isAdminUser) {
      unsub = subscribeToFirestoreJobs((firestorePosts) => {
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
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  return (
    <div className="app-root">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={() => setSearchQuery('')}
      />
      <Navbar
        onNavigate={(path) => {
          window.location.href = path;
        }}
      />
      <main className="main-content">
        <LastDateJobsPage
          jobs={jobs}
          onSelectJob={(id) => {
            const j = jobs.find(x => x.id === id);
            if (j) {
              window.location.href = getJobUrl(j);
            } else {
              window.location.href = `/job/${id}`;
            }
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
