import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function JobColumnsGrid({ jobs, onSelectJob }) {
  const renderColumn = (categoryKey, title, colorClass) => {
    const targetCat = categoryKey.toUpperCase();

    const catJobs = jobs.filter((j) => {
      const jobCat = (j.category || '').toUpperCase();
      if (targetCat.includes('RESULT')) {
        return jobCat.includes('RESULT') || jobCat.includes('ANSWER KEY');
      }
      return jobCat === targetCat || jobCat.includes(targetCat) || targetCat.includes(jobCat);
    });

    return (
      <div className={`column-card ${colorClass}`}>
        <div className="column-header">
          <h3>{title}</h3>
        </div>
        <div className="column-body">
          {catJobs.length === 0 ? (
            <div className="empty-state">No active updates.</div>
          ) : (
            <ul>
              {catJobs.map((job) => {
                let badgeClass = 'tag-last';
                let badgeText = job.badge || '';
                if (badgeText === 'New!' || badgeText === 'START') {
                  badgeClass = 'tag-new';
                  badgeText = 'New';
                }
                else if (badgeText === 'Out') badgeClass = 'tag-out';
                else if (badgeText === 'Link Active') badgeClass = 'tag-active';

                return (
                  <li key={job.id}>
                    <a
                      href="#"
                      className="job-item-link"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectJob(job.id);
                      }}
                    >
                      {job.title}
                      {badgeText && <sup><span className={`badge-tag ${badgeClass}`}>{badgeText}</span></sup>}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="columns-3-grid">
          {renderColumn('RESULT / ANSWER KEY', 'Result', 'col-darkred')}
          {renderColumn('ADMIT CARD', 'Admit Card', 'col-darkred')}
          {renderColumn('LATEST JOB', 'Latest Jobs', 'col-darkred')}
        </div>

        <div className="columns-3-grid" style={{ marginTop: '16px' }}>
          {renderColumn('SYLLABUS', 'Syllabus', 'col-darkred')}
          {renderColumn('ADMISSION', 'Admission', 'col-darkred')}
          {renderColumn('IMPORTANT', 'Important', 'col-darkred')}
        </div>
      </div>
    </main>
  );
}
