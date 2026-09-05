import React from 'react';

export default function HighlightsGrid({
  jobs,
  onSelectJob
}) {
  const topItems = jobs.slice(0, 8);
  
  const boxColors = [
    'bg-box-redorange',   // #ff3300 (BPSC TRE style)
    'bg-box-forestgreen', // #006b00 (UP Scholarship style)
    'bg-box-magentapink', // #ef35bf (India Post GDS style)
    'bg-box-vividblue',   // #1e7fe8 (CTET style)
    'bg-box-olive',       // #8d9200 (RRB JE style)
    'bg-box-deepblue',    // #1a2fc8 (Bihar STET style)
    'bg-box-orange',      // #ff6a00 (Anganwadi style)
    'bg-box-maroon'       // #a80000 (UPSSSC PET style)
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
