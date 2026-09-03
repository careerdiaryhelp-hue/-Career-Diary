import React from 'react';

export default function HighlightsGrid({
  jobs,
  onSelectJob
}) {
  const topItems = jobs.slice(0, 8);
  
  const boxColors = [
    'bg-box-pink', 'bg-box-blue', 'bg-box-green', 'bg-box-purple',
    'bg-box-orange', 'bg-box-teal', 'bg-box-darkred', 'bg-box-pink'
  ];

  return (
    <section className="featured-highlights-section">
      <div className="container" style={{ padding: '0 8px' }}>
        <div className="top-banners-grid">
          {topItems.length === 0 ? (
            <div className="empty-state">No featured notifications available.</div>
          ) : (
            topItems.map((job, index) => (
              <a
                key={job.id}
                href={`/${job.id}`}
                className={`banner-card ${boxColors[index] || 'bg-box-pink'}`}
                style={{ textDecoration: 'none', display: 'flex' }}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                    e.preventDefault();
                    onSelectJob(job.id);
                  }
                }}
              >
                <div className="banner-title">{job.title}</div>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
