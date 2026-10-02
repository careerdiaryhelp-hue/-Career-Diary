'use client';
import React, { useState } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import LastDateJobsPage from '../views/LastDateJobsPage';
import { getJobUrl } from '../data/categoryHelpers';

export default function LastDateClient({ jobs = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

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
