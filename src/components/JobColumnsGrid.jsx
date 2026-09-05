import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ALL_COLUMNS, getJobsForCategory } from '../data/categoryHelpers.js';

export default function JobColumnsGrid({
  jobs = [],
  currentCategory = 'all',
  searchQuery = '',
  onSelectJob,
  onNavigateCategory
}) {
  const renderJobItem = (job, isSingle = false) => {
    const rawBadge = job.badge || '';
    let badgeText = rawBadge;
    let badgeClass = 'tag-amber';
    const b = rawBadge.toLowerCase();

    if (b.includes('out') || b.includes('green')) {
      badgeClass = 'tag-out'; // Green
    } else if (b.includes('new') || b.includes('start') || b.includes('red')) {
      badgeClass = 'tag-new'; // Red
      badgeText = rawBadge === 'New!' ? 'New' : rawBadge;
    } else if (b.includes('active') || b.includes('link') || b.includes('admit') || b.includes('blue')) {
      badgeClass = 'tag-active'; // Blue
    } else if (b.includes('result') || b.includes('answer') || b.includes('purple')) {
      badgeClass = 'tag-purple'; // Purple
    } else if (b.includes('extended') || b.includes('teal')) {
      badgeClass = 'tag-teal'; // Teal
    } else if (b.includes('last') || b.includes('date')) {
      badgeClass = 'tag-amber'; // Amber
    }

    const lastDate =
      job.appLast ||
      job.lastDate ||
      job.importantDates?.applicationEnd ||
      job.importantDates?.lastDate ||
      null;

    return (
      <li key={job.id}>
        <a
          href={`/${job.id}`}
          className="job-item-link"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              onSelectJob(job.id);
            }
          }}
        >
          {job.title}
          {badgeText && (
            <sup>
              <span className={`badge-tag ${badgeClass}`}>{badgeText}</span>
            </sup>
          )}
          {isSingle && lastDate && (
            <span style={{ fontSize: '0.85rem', color: '#b30000', fontWeight: '600', marginLeft: '8px' }}>
              (Last Date: {lastDate})
            </span>
          )}
        </a>
      </li>
    );
  };

  const renderColumnCard = (col, catJobs, isSingle = false) => {
    // Show exactly 10 posts in homepage grid mode as requested; full list in single category view
    const displayedJobs = isSingle ? catJobs : catJobs.slice(0, 10);

    return (
      <div key={col.key} className={`column-card ${col.colorClass}`}>
        <div className="column-header">
          <h3>{isSingle ? (col.singleTitle || col.title) : col.title}</h3>
        </div>
        <div className="column-body">
          {displayedJobs.length === 0 ? (
            <div className="empty-state">No active updates.</div>
          ) : (
            <ul className={isSingle ? 'category-items-list' : ''}>
              {displayedJobs.map((job) => renderJobItem(job, isSingle))}
            </ul>
          )}
        </div>
        {!isSingle && (
          <div className="column-footer">
            <a
              href={col.slug}
              className="col-view-more"
              title={`View all ${col.title} (${catJobs.length} updates)`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  if (onNavigateCategory) {
                    onNavigateCategory(col.key, col.slug);
                  } else {
                    window.history.pushState({}, '', col.slug);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }
              }}
            >
              View More {col.title} &raquo;
            </a>
          </div>
        )}
      </div>
    );
  };

  // Case 1: A specific category is active (e.g. RESULT, ADMIT CARD, LATEST JOB, ADMISSION, etc.)
  if (currentCategory && currentCategory !== 'all') {
    const activeCol = ALL_COLUMNS.find(
      (c) =>
        c.key === currentCategory ||
        currentCategory.toUpperCase().includes(c.key) ||
        c.key.includes(currentCategory.toUpperCase())
    ) || {
      key: currentCategory,
      title: currentCategory,
      slug: `/${currentCategory.toLowerCase().replace(/\s+/g, '-')}`,
      singleTitle: `${currentCategory} 2026`,
      colorClass: 'col-darkred',
    };

    const catJobs = getJobsForCategory(jobs, activeCol.key);

    return (
      <main className="main-content">
        <div className="container columns-single-view">
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateCategory) onNavigateCategory('all', '/');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: '#1d4ed8',
                textDecoration: 'none',
                background: '#eff6ff',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe'
              }}
            >
              ← Back to Home
            </a>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Showing all <strong>{catJobs.length}</strong> updates in {activeCol.title}
            </span>
          </div>

          {renderColumnCard(activeCol, catJobs, true)}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateCategory) onNavigateCategory('all', '/');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: '#ffffff',
                background: '#a71b30',
                padding: '10px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(167, 27, 48, 0.25)'
              }}
            >
              ← Back to Home / All Updates
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Case 2: A search query is active
  if (searchQuery && searchQuery.trim()) {
    const populatedCols = ALL_COLUMNS.map((col) => ({
      ...col,
      items: getJobsForCategory(jobs, col.key),
    })).filter((col) => col.items.length > 0);

    if (populatedCols.length === 0) {
      return (
        <main className="main-content">
          <div className="container">
            <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
              No jobs found matching "{searchQuery}". Try a different keyword or reset search.
            </div>
          </div>
        </main>
      );
    }

    if (populatedCols.length === 1) {
      return (
        <main className="main-content">
          <div className="container columns-single-view">
            {renderColumnCard(populatedCols[0], populatedCols[0].items, true)}
          </div>
        </main>
      );
    }

    return (
      <main className="main-content">
        <div className="container">
          <div className="columns-3x3-grid">
            {populatedCols.map((col) => renderColumnCard(col, col.items))}
          </div>
        </div>
      </main>
    );
  }

  // Case 3: Home Page (currentCategory === 'all' and no search)
  // Render classic 3x3 Grid (9 columns, 3 per row)
  return (
    <main className="main-content">
      <div className="container">
        <div className="columns-3x3-grid">
          {ALL_COLUMNS.map((col) =>
            renderColumnCard(col, getJobsForCategory(jobs, col.key))
          )}
        </div>
      </div>
    </main>
  );
}
