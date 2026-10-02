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

    // Fetch fresh top forms from Firestore immediately on mount
    fetchTopOnlineFormsServer().then((fresh) => {
      if (active && Array.isArray(fresh) && fresh.length > 0) {
        setForms(fresh);
      }
    });

    // Real-time listener for live additions / removals in admin
    const unsub = subscribeToTopForms((livePosts) => {
      if (active && Array.isArray(livePosts) && livePosts.length > 0) {
        setForms(livePosts);
      }
    });

    return () => {
      active = false;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

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
