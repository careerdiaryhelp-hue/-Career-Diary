import React, { useMemo } from 'react';
import { Bell, Flame, ExternalLink } from 'lucide-react';

export default function TopTicker({ jobs = [], breakingNews = [], onSelectJob }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const tickerJobs = jobs && jobs.length > 0 ? jobs.slice(0, 10) : [];

  // Only use breaking news added & activated from Admin Dashboard (static list, no movement/duplication)
  const displayBreakingNews = useMemo(() => {
    if (!breakingNews || breakingNews.length === 0) return [];
    return breakingNews.filter(n => n.active !== false);
  }, [breakingNews]);

  const displayLatestJobs = useMemo(() => {
    if (!tickerJobs || tickerJobs.length === 0) return [];
    let list = [...tickerJobs];
    while (list.length < 8) {
      list = [...list, ...tickerJobs];
    }
    return [...list, ...list];
  }, [tickerJobs]);

  return (
    <div className="header-tickers-wrapper">
      {/* 1. Last Date Reminder */}
      <div className="last-date-bar">
        Last Date Reminder:- <a
          href="/last-date-jobs"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              onSelectJob('last-date-jobs');
            }
          }}
        >
          Click Here to Apply for Last Date Jobs List : {today}
        </a>
      </div>

      {/* 2. Breaking News Bar */}
      {displayBreakingNews.length > 0 && (
        <div className="breaking-news-bar">
          <div className="container breaking-bar-inner">
            <div className="breaking-label">
              <span className="breaking-pulse-dot" />
              BREAKING NEWS
            </div>
            <div className="breaking-ticker-wrapper">
              <div className="breaking-ticker-content">
                {displayBreakingNews.map((news, idx) => {
                  const hasLink = Boolean(news.link && news.link.trim());
                  return (
                    <span key={`${news.id || 'bn'}-${idx}`} className="breaking-item">
                      {idx > 0 && <span className="breaking-separator">✦</span>}
                      {news.category && (
                        <span className={`breaking-cat-tag cat-${news.category.toLowerCase().replace(/\s+/g, '-')}`}>
                          {news.category}
                        </span>
                      )}
                      {hasLink ? (
                        <a
                          href={news.link}
                          target={news.link.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if ((news.link.startsWith('/') || !news.link.startsWith('http')) && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                              e.preventDefault();
                              const slug = news.link.replace(/^\//, '');
                              onSelectJob(slug);
                            }
                          }}
                        >
                          {news.message}
                        </a>
                      ) : (
                        <span>{news.message}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Latest Update Bar */}
      {displayLatestJobs.length > 0 && (
        <div className="top-bar">
          <div className="container top-bar-inner">
            <div className="ticker-label">
              <Bell className="w-4 h-4 icon-pulse" /> Latest Update
            </div>
            <div className="ticker-wrapper">
              <div className="ticker-content">
                {displayLatestJobs.map((job, idx) => (
                  <span key={`${job.id}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#fbbf24', margin: '0 14px', fontSize: '0.8rem' }}>✦</span>
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
      )}
    </div>
  );
}
