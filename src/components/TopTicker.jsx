import React from 'react';
import { Bell } from 'lucide-react';

export default function TopTicker({ jobs = [], onSelectJob }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const tickerJobs = jobs && jobs.length > 0 ? jobs.slice(0, 6) : [];

  return (
    <>
      <div className="last-date-bar">
        Last Date Reminder:- <a
          href={tickerJobs[0] ? `/${tickerJobs[0].id}` : '/'}
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              if (tickerJobs[0]) onSelectJob(tickerJobs[0].id);
            }
          }}
        >
          Click Here to Apply for Last Date Jobs List : {today}
        </a>
      </div>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="ticker-label">
            <Bell className="w-4 h-4 icon-pulse" /> Latest Update
          </div>
          <div className="ticker-wrapper">
            <div className="ticker-content">
              {tickerJobs.map((job, idx) => (
                <span key={job.id}>
                  {idx === 0 ? '|- ' : '|| '}
                  <a
                    href={`/${job.id}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                        e.preventDefault();
                        onSelectJob(job.id);
                      }
                    }}
                  >
                    {job.title}
                  </a>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
