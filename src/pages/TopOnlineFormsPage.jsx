import React, { useMemo } from 'react';

export default function TopOnlineFormsPage({ jobs = [] }) {
  // Filter only jobs that are marked as isTopForm
  const topForms = useMemo(() => {
    return jobs.filter(j => Boolean(j.isTopForm));
  }, [jobs]);

  const boxColors = [
    'bg-box-redorange',   // #ff3300
    'bg-box-forestgreen', // #006b00
    'bg-box-magentapink', // #ef35bf
    'bg-box-vividblue',   // #1e7fe8
    'bg-box-olive',       // #8d9200
    'bg-box-deepblue',    // #1a2fc8
    'bg-box-orange',      // #ff6a00
    'bg-box-maroon',      // #a80000
    'bg-box-purple'       // #b900ff
  ];

  return (
    <div className="page-container" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '20px 8px' }}>
        {/* Info Header */}
        <div style={{ borderBottom: '2px solid #a80000', paddingBottom: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <strong style={{ color: '#a80000', width: '150px', flexShrink: 0 }}>Name of Post:</strong>
            <h1 style={{ color: '#a80000', fontSize: '24px', margin: 0, fontWeight: 'bold' }}>
              Top Online Form : Current Jobs/ Vacancy: 2026
            </h1>
          </div>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <strong style={{ color: '#a80000', width: '150px', flexShrink: 0 }}>Post Update Date:</strong>
            <strong style={{ color: '#000' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
          <div style={{ display: 'flex' }}>
            <strong style={{ color: '#a80000', width: '150px', flexShrink: 0 }}>Short Information:</strong>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>
              <strong>CareerDiary:</strong> CareerDiary Are Recently Uploaded Top Category of Online Form, Current Vacancy/ Jobs in Various Sector Like SSC, Banking, UPSC, Railway, Army, Navy, Airforce, Police, BPSC, All PCS, TET Vacancy and More Only at Single Page. All Interested Candidates Visit this Page and Easily Gather Full Information of Jobs then Apply Online Now with Fastest Network.
            </div>
          </div>
        </div>

        {/* Ad Space Top (Optional) */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="ad-placeholder" style={{ border: '1px dashed #ccc', padding: '10px', color: '#999' }}>
            [AdSense Slot - Top]
          </div>
        </div>

        {/* Grid of Forms */}
        <div className="top-banners-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {topForms.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: 'span 4' }}>No top online forms available at the moment.</div>
          ) : (
            topForms.map((job, index) => (
              <a
                key={job.id}
                href={`/${job.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`banner-card ${boxColors[index % boxColors.length]}`}
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                <div className="banner-title">{job.title}</div>
              </a>
            ))
          )}
        </div>

        {/* Ad Space Bottom (Optional) */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <div className="ad-placeholder" style={{ border: '1px dashed #ccc', padding: '10px', color: '#999' }}>
            [AdSense Slot - Bottom]
          </div>
        </div>

      </div>
    </div>
  );
}
