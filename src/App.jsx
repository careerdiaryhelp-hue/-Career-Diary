import React, { useState, useEffect } from 'react';
import { INITIAL_JOBS } from './data/initialJobs';
import TopTicker from './components/TopTicker';
import Header from './components/Header';
import Navbar from './components/Navbar';
import HighlightsGrid from './components/HighlightsGrid';
import JobColumnsGrid from './components/JobColumnsGrid';
import JobDetailModal from './components/JobDetailModal';
import PostJobModal from './components/PostJobModal';
import AgeCalcModal from './components/AgeCalcModal';
import Footer from './components/Footer';

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

  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentStateFilter, setCurrentStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('career_diary_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleAddJob = (newJob) => {
    setJobs([newJob, ...jobs]);
  };

  const handleResetFilters = () => {
    setCurrentCategory('all');
    setCurrentStateFilter('all');
    setSearchQuery('');
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

  return (
    <div className="app-root">
      <TopTicker onSelectJob={(id) => setSelectedJobId(id)} />

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenCalcModal={() => setIsCalcModalOpen(true)}
        onResetFilters={handleResetFilters}
      />

      <Navbar
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
      />

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

      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJobId(null)}
      />

      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddJob={handleAddJob}
      />

      <AgeCalcModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
      />

      <Footer
        onCategorySelect={(cat) => setCurrentCategory(cat)}
        onSearchSelect={(q) => setSearchQuery(q)}
      />
    </div>
  );
}
