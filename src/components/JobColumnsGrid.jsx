import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function JobColumnsGrid({
  jobs = [],
  currentCategory = 'all',
  searchQuery = '',
  onSelectJob,
  onNavigateCategory
}) {
  const ALL_COLUMNS = [
    { key: 'RESULT', title: 'Result', slug: '/results', colorClass: 'col-darkred', singleTitle: 'Results 2026' },
    { key: 'ADMIT CARD', title: 'Admit Card', slug: '/admit-card', colorClass: 'col-darkred', singleTitle: 'Admit Cards & Hall Tickets 2026' },
    { key: 'LATEST JOB', title: 'Latest Jobs', slug: '/latest-jobs', colorClass: 'col-darkred', singleTitle: 'Latest Govt Jobs Notifications 2026' },
    { key: 'ANSWER KEY', title: 'Answer Key', slug: '/answer-key', colorClass: 'col-darkred', singleTitle: 'Answer Keys & Solutions 2026' },
    { key: 'SYLLABUS', title: 'Syllabus', slug: '/syllabus', colorClass: 'col-darkred', singleTitle: 'Exam Pattern & Syllabus 2026' },
    { key: 'ADMISSION', title: 'Admission', slug: '/admission', colorClass: 'col-darkred', singleTitle: 'Admission Notifications 2026' },
    { key: 'DOCUMENTS', title: 'Documents', slug: '/documents', colorClass: 'col-darkred', singleTitle: 'Documents & Verification 2026' },
    { key: 'IMPORTANT', title: 'Important', slug: '/important', colorClass: 'col-darkred', singleTitle: 'Important Links & Services 2026' },
    { key: 'CERTIFICATE VERIFICATION', title: 'Certificate Verification', slug: '/certificate-verification', colorClass: 'col-darkred', singleTitle: 'Certificate Verification 2026' },
  ];

  const getJobsForCategory = (allJobs, categoryKey) => {
    const targetCat = (categoryKey || '').toUpperCase();
    return allJobs.filter((j) => {
      const jobCat = (j.category || '').toUpperCase();
      if (targetCat === 'ANSWER KEY') {
        return jobCat.includes('ANSWER') || jobCat.includes('KEY') || jobCat === 'ANSKEY';
      }
      if (targetCat === 'RESULT') {
        return jobCat.includes('RESULT') && !jobCat.includes('ANSWER') && !jobCat.includes('KEY');
      }
      if (targetCat === 'DOCUMENTS') {
        return jobCat.includes('DOCUMENT') || jobCat.includes('CERTIFICATE');
      }
      if (targetCat === 'LATEST JOB') {
        return jobCat.includes('JOB') || jobCat.includes('RECRUITMENT');
      }
      return jobCat === targetCat || jobCat.includes(targetCat) || targetCat.includes(jobCat);
    });
  };

  const renderJobItem = (job, isSingle = false) => {
    let badgeClass = 'tag-last';
    let badgeText = job.badge || '';
    if (badgeText === 'New!' || badgeText === 'START') {
      badgeClass = 'tag-new';
      badgeText = 'New';
    } else if (badgeText === 'Out') {
      badgeClass = 'tag-out';
    } else if (badgeText === 'Link Active') {
      badgeClass = 'tag-active';
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
    // Show maximum 20 posts in grid mode as requested
    const displayedJobs = isSingle ? catJobs : catJobs.slice(0, 20);

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
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  if (onNavigateCategory) {
                    onNavigateCategory(col.key);
                  } else {
                    window.history.pushState({}, '', col.slug);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }
              }}
            >
              View More <ChevronRight size={14} />
            </a>
          </div>
        )}
      </div>
    );
  };

  // Case 1: A specific category is active (e.g. IMPORTANT, LATEST JOB, ADMIT CARD, etc.)
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
          {renderColumnCard(activeCol, catJobs, true)}
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
