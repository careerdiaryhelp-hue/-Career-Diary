'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import JobColumnsGrid from './JobColumnsGrid';
import { DisplayAd } from './AdSenseBanner';
import { getJobUrl, getJobsForCategory } from '../data/categoryHelpers';
import { subscribeToFirestoreJobs } from '../firebase';
import { mergeAndSortJobs } from '../utils/jobsService';

export default function CategoryPageClient({ categoryKey, title, subtitle, initialJobs = [] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let unsubscribe = null;
    const isAdminUser = typeof window !== 'undefined' && (
      localStorage.getItem('career_diary_admin') === 'true' ||
      window.location.search.includes('admin')
    );

    if (isAdminUser) {
      unsubscribe = subscribeToFirestoreJobs((firestorePosts) => {
        if (Array.isArray(firestorePosts) && firestorePosts.length > 0) {
          const catPosts = getJobsForCategory(firestorePosts, categoryKey);
          setJobs(prev => mergeAndSortJobs(catPosts, prev));
        }
      });
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [categoryKey]);

  const filteredJobs = jobs.filter((job) => {
    if (!job || !job.title) return false;
    if (job.status === 'Draft' || job.status === 'draft') return false;
    if (searchQuery.trim()) {
      return job.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    }
    return true;
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

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={() => setSearchQuery('')}
      />
      <Navbar
        currentCategory={categoryKey}
        onNavigate={(path) => {
          window.location.href = path;
        }}
      />
      <main className="main-content container" style={{ minHeight: '650px', paddingTop: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#1e293b', fontSize: '1.6rem', fontWeight: 800 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>{subtitle}</p>
          )}
        </div>

        <div style={{ margin: '12px 0' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>

        <JobColumnsGrid
          jobs={filteredJobs}
          currentCategory={categoryKey}
          searchQuery={searchQuery}
          onSelectJob={(id) => {
            const j = initialJobs.find(x => x.id === id);
            if (j) window.location.href = getJobUrl(j);
          }}
          onNavigateCategory={(cat, slug) => {
            if (slug) window.location.href = slug;
          }}
        />
      </main>
      <Footer />

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
