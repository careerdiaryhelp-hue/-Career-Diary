import React, { useMemo } from 'react';
import { Bell } from 'lucide-react';

export default function TopTicker({ jobs = [], breakingNews = [], onSelectJob }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const tickerJobs = jobs && jobs.length > 0 ? jobs.filter(j => !j.title?.toLowerCase().includes('top online form')).slice(0, 10) : [];

  // Active breaking news from Admin Dashboard
  const activeBreakingNews = useMemo(() => {
    if (!breakingNews || breakingNews.length === 0) return [];
    return breakingNews.filter(n => n.active !== false && !n.message?.toLowerCase().includes('top online form') && !n.title?.toLowerCase().includes('top online form'));
  }, [breakingNews]);

  // Divide into up to 3 marquee lines matching Sarkari Result layout
  const marqueeRows = useMemo(() => {
    if (!activeBreakingNews || activeBreakingNews.length === 0) return [];
    const count = activeBreakingNews.length;
    if (count <= 3) {
      return activeBreakingNews.map(item => [item]);
    } else if (count <= 6) {
      const perRow = Math.ceil(count / 3);
      return [
        activeBreakingNews.slice(0, perRow),
        activeBreakingNews.slice(perRow, perRow * 2),
        activeBreakingNews.slice(perRow * 2)
      ];
    } else {
      const r1 = Math.ceil(count / 3);
      const remaining = count - r1;
      const r2 = Math.ceil(remaining / 2);
      return [
        activeBreakingNews.slice(0, r1),
        activeBreakingNews.slice(r1, r1 + r2),
        activeBreakingNews.slice(r1 + r2)
      ];
    }
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

      {/* 2. Latest Update Bar */}
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

      {/* 3. Portal Headline, Social Links & 3-Line Moving Marquee (Exact Sarkari Result Layout) */}
      <div className="container sr-top-section">
        <h1 className="sr-portal-title">
          Career Diary 2026 – CareerDiary.in – Career Diary Official
        </h1>

        <p className="sr-welcome-text">
          Welcome to No. 1 Education Portal Official Career Diary 2026 CareerDiary.in | Trusted by Millions
        </p>

        <p className="sr-app-links">
          <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer">
            Career Diary WhatsApp Channel
          </a>
          <span className="sr-app-sep">||</span>
          <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer">
            Telegram Channel
          </a>
          <span className="sr-app-sep">||</span>
          <a href="https://www.facebook.com/Careerdiary1?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer">
            Follow Facebook
          </a>
        </p>

        {marqueeRows.length > 0 && (
          <div className="sr-marquee-box">
            <div className="sr-marquee-box-header">
              <div className="sr-marquee-pill">
                Breaking news
              </div>
            </div>
            <div className="sr-marquee-container">
              {marqueeRows.map((row, rowIdx) => (
                <div key={`sr-marquee-row-${rowIdx}`} className="sr-marquee-row" align="center">
                  <marquee
                    behavior="alternate"
                    scrollamount="4"
                    onMouseOver={(e) => e.currentTarget.stop()}
                    onMouseOut={(e) => e.currentTarget.start()}
                  >
                    {row.map((news, idx) => {
                      const hasLink = Boolean(news.link && news.link.trim());
                      return (
                        <span key={`${news.id || 'bn'}-${rowIdx}-${idx}`} className="sr-marquee-item">
                          {idx > 0 && <span className="sr-marquee-sep">||</span>}
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
                              <b>{news.message}</b>
                            </a>
                          ) : (
                            <span><b>{news.message}</b></span>
                          )}
                        </span>
                      );
                    })}
                  </marquee>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
