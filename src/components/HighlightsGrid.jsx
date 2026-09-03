import React from 'react';
import { Flame } from 'lucide-react';

export default function HighlightsGrid({
  jobs,
  currentStateFilter,
  setCurrentStateFilter,
  onSelectJob
}) {
  const stateFilters = ['all', 'Bihar', 'SSC', 'Railway', 'Banking'];
  const topItems = jobs.slice(0, 8);

  return (
    <section className="featured-highlights-section">
      <div className="container">
        <div className="section-title-wrapper">
          <h2 className="section-heading">
            <Flame className="w-5 h-5 inline text-danger mr-1" /> TOP RECRUITMENT HIGHLIGHTS 2025
          </h2>
          <div className="state-filter-pills">
            {stateFilters.map((st) => (
              <button
                key={st}
                className={`pill-btn ${currentStateFilter === st ? 'active' : ''}`}
                onClick={() => setCurrentStateFilter(st)}
              >
                {st === 'all' ? 'All India' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="top-banners-grid">
          {topItems.length === 0 ? (
            <div className="empty-state">No featured notifications match your current filter.</div>
          ) : (
            topItems.map((job) => (
              <div
                key={job.id}
                className={`banner-card bg-${job.bannerColor || 'pink'}`}
                onClick={() => onSelectJob(job.id)}
              >
                <div className="banner-title">{job.title}</div>
                {job.badge && <span className="banner-badge">{job.badge}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
