import React from 'react';

export default function JobColumnsGrid({
  jobs,
  currentCategory = 'all',
  searchQuery = '',
  onSelectJob
}) {
  const ALL_COLUMNS = [
    { key: 'RESULT / ANSWER KEY', title: 'Result', colorClass: 'col-darkred', singleTitle: 'Results & Answer Keys 2026' },
    { key: 'ADMIT CARD', title: 'Admit Card', colorClass: 'col-darkred', singleTitle: 'Admit Cards & Hall Tickets 2026' },
    { key: 'LATEST JOB', title: 'Latest Jobs', colorClass: 'col-darkred', singleTitle: 'Latest Govt Jobs Notifications 2026' },
    { key: 'SYLLABUS', title: 'Syllabus', colorClass: 'col-darkred', singleTitle: 'Exam Pattern & Syllabus 2026' },
    { key: 'ADMISSION', title: 'Admission', colorClass: 'col-darkred', singleTitle: 'Admission Notifications 2026' },
    { key: 'IMPORTANT', title: 'Important', colorClass: 'col-darkred', singleTitle: 'Important Links & Online Services 2026' },
  ];

  const getJobsForCategory = (allJobs, categoryKey) => {
    const targetCat = categoryKey.toUpperCase();
    return allJobs.filter((j) => {
      const jobCat = (j.category || '').toUpperCase();
      if (targetCat.includes('RESULT')) {
        return jobCat.includes('RESULT') || jobCat.includes('ANSWER KEY');
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
    return (
      <div key={col.key} className={`column-card ${col.colorClass}`}>
        <div className="column-header">
          <h3>{isSingle ? (col.singleTitle || col.title) : col.title}</h3>
        </div>
        <div className="column-body">
          {catJobs.length === 0 ? (
            <div className="empty-state">No active updates.</div>
          ) : (
            <ul className={isSingle ? 'category-items-list' : ''}>
              {catJobs.map((job) => renderJobItem(job, isSingle))}
            </ul>
          )}
        </div>
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

  // Case 2: A search query is active (e.g. /rrb, /ssc, or user search)
  // Only show columns that actually have matching jobs!
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
          <div className="columns-3-grid">
            {populatedCols.map((col) => renderColumnCard(col, col.items))}
          </div>
        </div>
      </main>
    );
  }

  // Case 3: Home Page (currentCategory === 'all' and no search)
  // Render classic 2 rows of 3 columns
  return (
    <main className="main-content">
      <div className="container">
        <div className="columns-3-grid">
          {renderColumnCard(ALL_COLUMNS[0], getJobsForCategory(jobs, ALL_COLUMNS[0].key))}
          {renderColumnCard(ALL_COLUMNS[1], getJobsForCategory(jobs, ALL_COLUMNS[1].key))}
          {renderColumnCard(ALL_COLUMNS[2], getJobsForCategory(jobs, ALL_COLUMNS[2].key))}
        </div>

        <div className="columns-3-grid" style={{ marginTop: '16px' }}>
          {renderColumnCard(ALL_COLUMNS[3], getJobsForCategory(jobs, ALL_COLUMNS[3].key))}
          {renderColumnCard(ALL_COLUMNS[4], getJobsForCategory(jobs, ALL_COLUMNS[4].key))}
          {renderColumnCard(ALL_COLUMNS[5], getJobsForCategory(jobs, ALL_COLUMNS[5].key))}
        </div>
      </div>
    </main>
  );
}
