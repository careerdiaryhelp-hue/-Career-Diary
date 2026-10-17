'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import TopOnlineFormsPage from '../views/TopOnlineFormsPage';
import { fetchTopOnlineFormsServer, subscribeToTopForms } from '../firebase';

export default function TopOnlineFormsClient({ initialJobs = [], fallbackJobs = [] }) {
  const [forms, setForms] = useState(() => (Array.isArray(initialJobs) ? initialJobs : []));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;

    // 1. Instant hydration from sessionStorage if previously cached
    try {
      const cached = sessionStorage.getItem('careerdiary_top_forms');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setForms(parsed);
        }
      }
    } catch (_) {}

    // 2. Fetch fresh top forms from /api/top-forms for ALL browsers
    fetch('/api/top-forms')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(fresh => {
        if (active && Array.isArray(fresh) && fresh.length > 0) {
          try {
            sessionStorage.setItem('careerdiary_top_forms', JSON.stringify(fresh));
          } catch (_) {}
          setForms(fresh);
        }
      })
      .catch(() => {
        fetchTopOnlineFormsServer().then((fresh) => {
          if (active && Array.isArray(fresh) && fresh.length > 0) {
            try {
              sessionStorage.setItem('careerdiary_top_forms', JSON.stringify(fresh));
            } catch (_) {}
            setForms(fresh);
          }
        }).catch(() => {});
      });

    // 3. Admin Real-time Listener
    const isAdminUser = typeof window !== 'undefined' && (
      localStorage.getItem('career_diary_admin') === 'true' ||
      window.location.search.includes('admin')
    );

    let unsub = null;
    if (isAdminUser) {
      unsub = subscribeToTopForms((livePosts) => {
        if (active && Array.isArray(livePosts) && livePosts.length > 0) {
          try {
            sessionStorage.setItem('careerdiary_top_forms', JSON.stringify(livePosts));
          } catch (_) {}
          setForms(livePosts);
        }
      });
    }

    return () => {
      active = false;
      if (typeof unsub === 'function') unsub();
    };
  }, [initialJobs]);

  const displayJobs = useMemo(() => {
    let source = forms;
    if ((!source || source.length === 0) && fallbackJobs && fallbackJobs.length > 0) {
      source = fallbackJobs.slice(0, 16);
    }
    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase().trim();
    return source.filter((item) => (item.title || '').toLowerCase().includes(q));
  }, [forms, fallbackJobs, searchQuery]);

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
        <TopOnlineFormsPage jobs={displayJobs} />
      </main>
      <Footer />
    </div>
  );
}
