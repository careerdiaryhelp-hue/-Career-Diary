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
    // Sync cached live jobs after hydration to avoid SSR mismatch
    try {
      const cached = sessionStorage.getItem('careerdiary_live_jobs');
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

    let unsub = null;
    if (isAdminUser || !initialJobs || initialJobs.length === 0) {
      unsub = subscribeToFirestoreJobs((firestorePosts) => {
        if (Array.isArray(firestorePosts) && firestorePosts.length > 0) {
          try {
            sessionStorage.setItem('careerdiary_live_jobs', JSON.stringify(firestorePosts));
          } catch (_) {}
          setJobs(prev => mergeAndSortJobs(firestorePosts, prev));
        }
      }, (err) => console.warn(err), isAdminUser ? 150 : 30);
    }

    return () => {
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
