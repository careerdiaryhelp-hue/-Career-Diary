import React, { useMemo } from 'react';

export default function HighlightsGrid({
  jobs = [],
  onSelectJob
}) {
  const topItems = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    const featuredJobs = jobs.filter(j => Boolean(j.isFeatured || j.isTopCard || j.featured));
    let selectedJobs = [];

    if (featuredJobs.length > 0) {
      const sorted = [...featuredJobs].sort((a, b) => {
        const orderA = a.featuredOrder ?? a.displayOrder ?? 999;
        const orderB = b.featuredOrder ?? b.displayOrder ?? 999;
        return orderA - orderB;
      });
      selectedJobs = sorted.slice(0, 7);
    } else {
      selectedJobs = jobs.slice(0, 7);
    }
    
    // Inject "Top Online Form" precisely at index 3 (4th box) to match 8-box design
    const finalGrid = [...selectedJobs];
    finalGrid.splice(3, 0, {
      id: 'top-online-forms',
      title: 'Top Online Form\nJob List 2026',
      link: '/top-online-form-list',
      isStatic: true
    });
    
    return finalGrid;
  }, [jobs]);
  
  const boxColors = [
    'bg-box-redorange',   // #e31e5c
    'bg-box-forestgreen', // #0056b3
    'bg-box-magentapink', // #147f2c
    'bg-box-purple',      // #d600ff (Top Form)
    'bg-box-vividblue',   // #f2471c
    'bg-box-olive',       // #007a75
    'bg-box-deepblue',    // #a9000b
    'bg-box-orange',      // #cc0052
  ];

  return (
    <section className="featured-highlights-section">
      <div className="container">
        <div className="top-banners-grid">
          {topItems.map((item, index) => (
            <a
              key={item.id}
              href={item.isStatic ? item.link : `/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`banner-card ${boxColors[index % boxColors.length]}`}
              style={{ textDecoration: 'none', display: 'flex' }}
            >
              <div className="banner-title" style={{ whiteSpace: 'pre-wrap' }}>{item.title}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

