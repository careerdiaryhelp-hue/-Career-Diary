import React, { useMemo } from 'react';
import { Bell, Flame, ExternalLink } from 'lucide-react';
import { isResult, isAdmitCard, isLatestJob, isAdmission } from '../data/categoryHelpers.js';

export default function TopTicker({ jobs = [], breakingNews = [], onSelectJob }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const tickerJobs = jobs && jobs.length > 0 ? jobs.slice(0, 10) : [];

  // Helper to extract top N jobs for a category
  const getCategoryPosts = (filterFn, limit = 2) => {
    return (jobs || []).filter(filterFn).slice(0, limit);
  };

  const topResults = getCategoryPosts(isResult, 2);
  const topAdmits = getCategoryPosts(isAdmitCard, 2);
  const topJobs = getCategoryPosts(isLatestJob, 2);
  const topAdmissions = getCategoryPosts(isAdmission, 2);

  const dynamicCategoryNews = [
    ...topResults.map(j => ({ id: `dyn-res-${j.id}`, category: 'Result', message: j.title, link: `/${j.id}` })),
    ...topAdmits.map(j => ({ id: `dyn-adm-${j.id}`, category: 'Admit Card', message: j.title, link: `/${j.id}` })),
    ...topJobs.map(j => ({ id: `dyn-job-${j.id}`, category: 'Latest Job', message: j.title, link: `/${j.id}` })),
    ...topAdmissions.map(j => ({ id: `dyn-admiss-${j.id}`, category: 'Admission', message: j.title, link: `/${j.id}` })),
  ];

  // Active custom breaking news from admin
  const activeCustomNews = (breakingNews && breakingNews.length > 0)
    ? breakingNews.filter(n => n.active !== false)
    : [];

  // Combine admin alerts with dynamic category alerts (avoiding duplicates)
  let activeBreakingNews = [];
  if (activeCustomNews.length > 0) {
    const customLinksAndMsgs = new Set(
      activeCustomNews.map(c => (c.link || '').replace(/^\//, '').toLowerCase() + '|' + (c.message || '').trim().toLowerCase())
    );
    activeBreakingNews = [
      ...activeCustomNews,
      ...dynamicCategoryNews.filter(dyn => {
        const dynKey = (dyn.link || '').replace(/^\//, '').toLowerCase() + '|' + (dyn.message || '').trim().toLowerCase();
        return !customLinksAndMsgs.has(dynKey) && !activeCustomNews.some(c => (c.link && c.link.includes(dyn.link.replace(/^\//, ''))));
      })
    ];
  } else {
    activeBreakingNews = dynamicCategoryNews;
  }

  // Duplicate items for 100% immediate load (translateX: 0) and seamless infinite loop
  const displayBreakingNews = useMemo(() => {
    if (!activeBreakingNews || activeBreakingNews.length === 0) return [];
    let list = [...activeBreakingNews];
    while (list.length < 8) {
      list = [...list, ...activeBreakingNews];
    }
    // Duplicated: first half (0 to -50%) loops smoothly into second half (-50% to -100%)
    return [...list, ...list];
  }, [activeBreakingNews]);

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
                      <span className="breaking-separator">✦</span>
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
