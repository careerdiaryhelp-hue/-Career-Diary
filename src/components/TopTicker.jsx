import React from 'react';
import { Bell, Flame, ExternalLink } from 'lucide-react';

export default function TopTicker({ jobs = [], breakingNews = [], onSelectJob }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const tickerJobs = jobs && jobs.length > 0 ? jobs.slice(0, 10) : [];

  // Helper to extract top N jobs for a category
  const getCategoryPosts = (filterFn, limit = 2) => {
    return (jobs || []).filter(filterFn).slice(0, limit);
  };

  const topResults = getCategoryPosts(j => (j.category || '').toUpperCase().includes('RESULT'), 2);
  const topAdmits = getCategoryPosts(j => (j.category || '').toUpperCase().includes('ADMIT'), 2);
  const topJobs = getCategoryPosts(j => {
    const c = (j.category || '').toUpperCase();
    return (c.includes('JOB') || c.includes('RECRUITMENT')) && !c.includes('ADMIT') && !c.includes('RESULT');
  }, 2);
  const topAdmissions = getCategoryPosts(j => (j.category || '').toUpperCase().includes('ADMISSION'), 2);

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

  return (
    <div className="header-tickers-wrapper">
      {/* 1. Last Date Reminder */}
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

      {/* 2. Breaking News Bar */}
      {activeBreakingNews.length > 0 && (
        <div className="breaking-news-bar">
          <div className="container breaking-bar-inner">
            <div className="breaking-label">
              <span className="breaking-pulse-dot" />
              BREAKING
            </div>
            <div className="breaking-ticker-wrapper">
              <div className="breaking-ticker-content">
                {activeBreakingNews.map((news, idx) => {
                  const hasLink = Boolean(news.link && news.link.trim());
                  return (
                    <span key={news.id || idx} className="breaking-item">
                      {idx === 0 ? '▶ ' : '   ✦   '}
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
    </div>
  );
}
