import React, { useMemo } from 'react';
import { Bell, Newspaper, ExternalLink } from 'lucide-react';

export default function TopTicker({ jobs = [], breakingNews = [], onSelectJob }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const tickerJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    const explicitLatest = jobs.filter(j => Boolean(j.isLatestUpdate || j.isLatest));
    if (explicitLatest.length > 0) {
      return [...explicitLatest].sort((a, b) => {
        const orderA = a.latestOrder ?? a.displayOrder ?? 999;
        const orderB = b.latestOrder ?? b.displayOrder ?? 999;
        return orderA - orderB;
      });
    }
    return jobs.filter(j => !j.title?.toLowerCase().includes('top online form')).slice(0, 10);
  }, [jobs]);

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
                {displayLatestJobs.map((job, idx) => {
                  const rawTarget = job.link || job.url || job.id || job.slug || '';
                  let cleanSlug = rawTarget;
                  if (cleanSlug.includes('careerdiary.in/')) {
                    cleanSlug = cleanSlug.split('careerdiary.in/')[1];
                  } else if (cleanSlug.startsWith('/')) {
                    cleanSlug = cleanSlug.slice(1);
                  }
                  const href = rawTarget.startsWith('http') ? rawTarget : (rawTarget.startsWith('/') ? rawTarget : `/${rawTarget}`);
                  const isExternal = rawTarget.startsWith('http') && !rawTarget.includes('careerdiary.in');

                  return (
                    <span key={`${job.id || idx}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#fbbf24', margin: '0 14px', fontSize: '0.8rem' }}>✦</span>
                      <a
                        href={href}
                        target={isExternal ? '_blank' : '_self'}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          if (!isExternal && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                            e.preventDefault();
                            onSelectJob(cleanSlug);
                          }
                        }}
                      >
                        {job.title || job.message}
                      </a>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 Creative Banner: Today Current Affairs */}
      <div style={{ margin: '14px 0 6px 0', padding: '0 12px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: 0 }}>
          <a
            href="https://sarkariguidejob.com/current-affairs/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '12px 20px',
              color: '#ffffff',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(67, 56, 202, 0.35)',
              transition: 'all 0.25s ease-in-out',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(67, 56, 202, 0.35)';
            }}
          >
            {/* Background Glow */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '50%',
              pointerEvents: 'none',
              filter: 'blur(12px)'
            }} />

            {/* Left Content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1, flex: '1 1 auto', minWidth: '280px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.45)',
                boxSizing: 'border-box'
              }}>
                <Newspaper style={{ width: '22px', height: '22px', display: 'block', flexShrink: 0 }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                  }}>
                    🔥 TODAY LIVE
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
                    Daily Updates & Quiz
                  </span>
                </div>

                <div style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '4px',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  Today Current Affairs 2026 – Read Daily GK Notes & Live Updates
                </div>
              </div>
            </div>

            {/* Right Button */}
            <div style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.88rem',
              padding: '9px 18px',
              borderRadius: '30px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
              whiteSpace: 'nowrap',
              zIndex: 1,
              marginLeft: 'auto'
            }}>
              Read Today Current Affairs <ExternalLink style={{ width: '15px', height: '15px' }} />
            </div>
          </a>
        </div>
      </div>

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
