import React from 'react';
import { Briefcase, FileText, IdCard, CheckSquare, GraduationCap, Bookmark, ChevronRight } from 'lucide-react';

export default function JobColumnsGrid({ jobs, onSelectJob }) {
  const renderColumn = (category, title, icon, colorClass) => {
    const Icon = icon;
    const catJobs = jobs.filter((j) => j.category === category);

    return (
      <div className={`column-card ${colorClass}`}>
        <div className="column-header">
          <h3>
            <Icon className="w-4 h-4 inline" /> {title}
          </h3>
          <span className="badge badge-count">{catJobs.length}</span>
        </div>
        <div className="column-body">
          {catJobs.length === 0 ? (
            <div className="empty-state">No active updates.</div>
          ) : (
            catJobs.map((job) => {
              let badgeClass = 'tag-last';
              if (job.badge === 'New!' || job.badge === 'START') badgeClass = 'tag-new';
              else if (job.badge === 'Out') badgeClass = 'tag-out';
              else if (job.badge === 'Link Active') badgeClass = 'tag-active';

              return (
                <a
                  key={job.id}
                  href="#"
                  className="job-item-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectJob(job.id);
                  }}
                >
                  <ChevronRight className="w-3.5 h-3.5 inline opacity-60 mr-1" />
                  {job.title}
                  {job.badge && <span className={`badge-tag ${badgeClass}`}>{job.badge}</span>}
                  {job.lastDate && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {' '}
                      (Last Date: {job.lastDate})
                    </span>
                  )}
                </a>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="columns-4-grid">
          {renderColumn('LATEST JOB', 'LATEST JOB', Briefcase, 'col-pink')}
          {renderColumn('SYLLABUS', 'SYLLABUS', FileText, 'col-green')}
          {renderColumn('ADMIT CARD', 'ADMIT CARD', IdCard, 'col-blue')}
          {renderColumn('RESULT / ANSWER KEY', 'ANSWER KEY / RESULT', CheckSquare, 'col-purple')}
        </div>

        <div className="secondary-grid">
          {renderColumn('ADMISSION', 'ADMISSION 2025', GraduationCap, 'col-orange')}
          {renderColumn('IMPORTANT', 'IMPORTANT SCHEMES & CERTIFICATES', Bookmark, 'col-teal')}
        </div>
      </div>
    </main>
  );
}
