import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Flame, Clock, Search, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isResult, isAnswerKey, isAdmitCard } from '../data/categoryHelpers.js';

// Month names mapping for dynamic parsing
const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

/**
 * Fully dynamic date parser supporting Indian Sarkari job date formats:
 * - "04 September 2026", "4 Sept 2026", "04-Sep-2026", "4th Sep 2026"
 * - "September 04, 2026", "Sep 4, 2026"
 * - "04/09/2026", "04-09-2026", "04.09.2026", "4/9/2026" (DD/MM/YYYY)
 * - "2026-09-04" (YYYY-MM-DD ISO)
 * - "04/09/2026 (5:00 PM)", "04 September 2026 (Today)", "Till 15-09-2026"
 * - Keywords: "today", "tomorrow"
 */
export const parseDateSafe = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // Exclude non-dates
  if (/(?:check|notice|rules|soon|notify|na|n\/a|tba|tbd|available)/i.test(lower)) {
    return null;
  }

  // Dynamic "today" keyword
  if (lower.includes('today')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Dynamic "tomorrow" keyword
  if (lower.includes('tomorrow')) {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    tom.setHours(0, 0, 0, 0);
    return tom;
  }

  // Remove ordinal suffixes like 1st, 2nd, 3rd, 4th, 21st, 22nd...
  const cleaned = lower.replace(/(\d+)(st|nd|rd|th)\b/g, '$1');

  // Pattern 1: DD Month YYYY (e.g. "04 September 2026", "4 sep 2026", "04-sep-2026")
  const match1 = cleaned.match(/\b(0?[1-9]|[12]\d|3[01])[-/\s]+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember|t)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[-/\s,]+(\d{4}|\d{2})\b/i);
  if (match1) {
    const day = parseInt(match1[1], 10);
    const month = MONTH_MAP[match1[2].toLowerCase()];
    let year = parseInt(match1[3], 10);
    if (year < 100) year += 2000;
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  // Pattern 2: Month DD, YYYY (e.g. "September 04, 2026", "Sep 4, 2026")
  const match2 = cleaned.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember|t)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[-/\s]+(0?[1-9]|[12]\d|3[01])[-/\s,]+(\d{4}|\d{2})\b/i);
  if (match2) {
    const month = MONTH_MAP[match2[1].toLowerCase()];
    const day = parseInt(match2[2], 10);
    let year = parseInt(match2[3], 10);
    if (year < 100) year += 2000;
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  // Pattern 3: YYYY-MM-DD (ISO)
  const match3 = cleaned.match(/\b(\d{4})[-/\.](0?[1-9]|1[0-2])[-/\.](0?[1-9]|[12]\d|3[01])\b/);
  if (match3) {
    const year = parseInt(match3[1], 10);
    const month = parseInt(match3[2], 10) - 1;
    const day = parseInt(match3[3], 10);
    return new Date(year, month, day);
  }

  // Pattern 4: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (Standard Indian Govt format)
  const match4 = cleaned.match(/\b(0?[1-9]|[12]\d|3[01])[-/\.](0?[1-9]|1[0-2])[-/\.](\d{4}|\d{2})\b/);
  if (match4) {
    const day = parseInt(match4[1], 10);
    const month = parseInt(match4[2], 10) - 1;
    let year = parseInt(match4[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }

  // Fallback: standard Date.parse
  const ts = Date.parse(trimmed);
  if (!isNaN(ts)) {
    const d = new Date(ts);
    if (d.getFullYear() >= 2020 && d.getFullYear() <= 2040) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }

  return null;
};

/**
 * Calculates day difference dynamically:
 *  0 = Today
 *  1 = Tomorrow
 * >0 = Days remaining
 * <0 = Expired / Passed
 */
export const getDayDiff = (targetDate, refDate = new Date()) => {
  if (!targetDate) return null;
  const t = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const r = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const diffMs = t.getTime() - r.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export default function LastDateJobsPage({ jobs = [], onSelectJob, onBack }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'week'
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic current date reference
  const now = new Date();
  const todayFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const todayDayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  // Helper to extract last date string from a job
  const extractLastDate = (job) => {
    if (!job) return '';
    if (job.lastDate && typeof job.lastDate === 'string' && job.lastDate.trim()) return job.lastDate.trim();
    if (job.appLast && typeof job.appLast === 'string' && job.appLast.trim()) return job.appLast.trim();
    if (job.applyLastDate && typeof job.applyLastDate === 'string' && job.applyLastDate.trim()) return job.applyLastDate.trim();

    const dates = job.importantDates || job.important_dates || {};
    for (const [k, v] of Object.entries(dates)) {
      const kl = k.toLowerCase();
      if ((kl.includes('last date') || kl.includes('closing') || kl.includes('last day') || kl.includes('application end') || kl.includes('apply end')) && typeof v === 'string' && v.trim()) {
        return v.trim();
      }
    }

    // Fallback fee last date or other closing key
    for (const [k, v] of Object.entries(dates)) {
      const kl = k.toLowerCase();
      if (kl.includes('last') && typeof v === 'string' && v.trim()) {
        return v.trim();
      }
    }

    // Regex check in description
    const desc = job.description || job.uniqueDescription || '';
    const match = desc.match(/(?:last date|apply until|apply till|submit the application form was|closing date)[:\s]+(?:is\s+)?([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{1,2}[-\/\.][0-9]{1,2}[-\/\.][0-9]{2,4})/i);
    if (match) return match[1].trim();

    return 'Check Official Notice';
  };

  // Extract direct apply URL or fallback
  const getApplyUrl = (job) => {
    if (job.applyUrl && typeof job.applyUrl === 'string' && job.applyUrl.startsWith('http')) return job.applyUrl;
    const links = job.importantLinks || job.important_links || {};
    for (const [k, v] of Object.entries(links)) {
      const kl = k.toLowerCase();
      const vl = typeof v === 'string' ? v : (v?.url || '');
      if ((kl.includes('apply') || kl.includes('registration') || kl.includes('form') || kl.includes('online')) && vl.startsWith('http')) {
        return vl;
      }
    }
    return null;
  };

  // Build list of active jobs with dynamically calculated last date info
  // STRICT RULE: All expired / closed jobs and non-job categories are filtered out
  const enrichedJobs = useMemo(() => {
    const todayRef = new Date();
    const currentYear = todayRef.getFullYear();

    return (jobs || [])
      .filter(j => {
        if (!j || j.status === 'Draft' || j.status === 'draft') return false;
        if (j.status && (j.status.toLowerCase().includes('closed') || j.status.toLowerCase().includes('expired'))) return false;
        // Only include jobs, recruitments, and admissions (exclude results, admit cards, answer keys)
        if (isResult(j) || isAnswerKey(j) || isAdmitCard(j)) return false;
        return true;
      })
      .map(job => {
        const lastDateStr = extractLastDate(job);
        const parsedDate = parseDateSafe(lastDateStr);
        let diffDays = getDayDiff(parsedDate, todayRef);

        // Check if date explicitly contains a past year (e.g. 2024, 2025 when current year is 2026)
        let isPastYear = false;
        const yearMatch = lastDateStr.match(/\b(201\d|202[0-5])\b/);
        if (yearMatch && parseInt(yearMatch[1], 10) < currentYear) {
          isPastYear = true;
          if (diffDays === null || diffDays >= 0) {
            diffDays = -999;
          }
        }

        const isToday = diffDays === 0;
        const isTomorrow = diffDays === 1;
        const isSoon = diffDays !== null && diffDays >= 0 && diffDays <= 15;
        const isExpired = isPastYear || (diffDays !== null && diffDays < 0);
        const applyUrl = getApplyUrl(job);

        return {
          ...job,
          extractedLastDate: lastDateStr,
          parsedDate,
          diffDays,
          isToday,
          isTomorrow,
          isSoon,
          isExpired,
          applyUrlDirect: applyUrl,
        };
      })
      // "jo end ho gya hi wo na dikhe" -> STRICTLY filter out all expired / ended jobs
      .filter(job => !job.isExpired);
  }, [jobs]);

  // Filter based on active tab and search query
  const displayedJobs = useMemo(() => {
    return enrichedJobs
      .filter(job => {
        if (filterType === 'today') return job.isToday;
        if (filterType === 'week') return job.isToday || job.isSoon;
        return true; // 'all' active jobs
      })
      .filter(job => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.organization && job.organization.toLowerCase().includes(q)) ||
          (job.extractedLastDate && job.extractedLastDate.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // 1. Today's jobs always ranked at the very top
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;

        // 2. Tomorrow's jobs ranked next
        if (a.isTomorrow && !b.isTomorrow) return -1;
        if (!a.isTomorrow && b.isTomorrow) return 1;

        // 3. Sort chronologically by nearest deadline (least days remaining first)
        if (a.diffDays !== null && b.diffDays !== null) {
          return a.diffDays - b.diffDays;
        }

        // 4. Jobs with specific dates before "Check Official Notice"
        if (a.diffDays !== null && b.diffDays === null) return -1;
        if (a.diffDays === null && b.diffDays !== null) return 1;

        return 0;
      });
  }, [enrichedJobs, filterType, searchQuery]);

  const todayCount = enrichedJobs.filter(j => j.isToday).length;
  const soonCount = enrichedJobs.filter(j => j.isSoon).length;

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '50px', maxWidth: '1050px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={onBack}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      {/* Main Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '2px solid #b91c1c',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        {/* Red Title Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: '#ffffff',
          padding: '18px 20px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '0.5px' }}>
            ⏰ Last Date Reminder – Govt Jobs Application Deadline List
          </h1>
          <div style={{ marginTop: '8px', fontSize: '0.95rem', opacity: 0.95, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Calendar className="w-4 h-4" />
            <span>Today's Date: <strong>{todayFormatted} ({todayDayName})</strong></span>
          </div>
        </div>

        {/* Advisory Box */}
        <div style={{
          backgroundColor: '#fffbeb',
          borderBottom: '1px solid #fef3c7',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          color: '#92400e'
        }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span>
            <strong>महत्वपूर्ण सूचना:</strong> जिन भर्तियों की अंतिम तिथि आज अथवा निकट भविष्य में है, उनके लिए सर्वर व्यस्तता से बचने हेतु अंतिम समय से पहले ऑनलाइन आवेदन अवश्य पूरा कर लें।
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          padding: '14px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Dynamic Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '1px solid #cbd5e1',
                background: filterType === 'all' ? '#1e293b' : '#ffffff',
                color: filterType === 'all' ? '#ffffff' : '#334155',
                transition: 'all 0.15s'
              }}
            >
              All Ending Jobs ({enrichedJobs.length})
            </button>

            <button
              onClick={() => setFilterType('today')}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '1px solid #dc2626',
                background: filterType === 'today' ? '#dc2626' : '#ffffff',
                color: filterType === 'today' ? '#ffffff' : '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <Flame className="w-4 h-4 text-orange-500" /> Ending Today ({todayCount})
            </button>

            <button
              onClick={() => setFilterType('week')}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '1px solid #2563eb',
                background: filterType === 'week' ? '#2563eb' : '#ffffff',
                color: filterType === 'week' ? '#ffffff' : '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <Clock className="w-4 h-4" /> Ending Soon (Next 15 Days) ({soonCount})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by job name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                fontSize: '0.86rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Jobs Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                <th style={{ padding: '10px 14px', width: '5%', textAlign: 'center' }}>#</th>
                <th style={{ padding: '10px 14px', width: '42%' }}>Job / Recruitment Post Name</th>
                <th style={{ padding: '10px 14px', width: '20%' }}>Organization</th>
                <th style={{ padding: '10px 14px', width: '13%', textAlign: 'center' }}>Total Post</th>
                <th style={{ padding: '10px 14px', width: '20%', textAlign: 'center' }}>Last Date</th>
              </tr>
            </thead>
            <tbody>
              {displayedJobs.length > 0 ? (
                displayedJobs.map((job, idx) => {
                  const isRowToday = job.isToday;
                  const isRowTomorrow = job.isTomorrow;
                  const isRowSoon = job.isSoon && !isRowToday && !isRowTomorrow;

                  return (
                    <tr
                      key={job.id || idx}
                      style={{
                        backgroundColor: isRowToday
                          ? '#fef2f2'
                          : isRowTomorrow
                          ? '#fffbeb'
                          : (idx % 2 === 0 ? '#ffffff' : '#f8fafc'),
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* S.No */}
                      <td style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: isRowToday ? '#dc2626' : (isRowTomorrow ? '#d97706' : '#64748b')
                      }}>
                        {idx + 1}
                      </td>

                      {/* Post Name + Dynamic Badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flexWrap: 'wrap' }}>
                          {isRowToday && (
                            <span style={{
                              backgroundColor: '#dc2626',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginTop: '2px',
                              flexShrink: 0
                            }}>
                              🔥 TODAY
                            </span>
                          )}

                          {isRowTomorrow && (
                            <span style={{
                              backgroundColor: '#d97706',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginTop: '2px',
                              flexShrink: 0
                            }}>
                              ⚡ TOMORROW
                            </span>
                          )}

                          {isRowSoon && job.diffDays !== null && (
                            <span style={{
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginTop: '2px',
                              flexShrink: 0
                            }}>
                              ⏳ {job.diffDays} DAYS LEFT
                            </span>
                          )}

                          <a
                            href={`/${job.id}`}
                            onClick={(e) => {
                              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                e.preventDefault();
                                onSelectJob(job.id);
                              }
                            }}
                            style={{
                              color: isRowToday ? '#b91c1c' : (isRowTomorrow ? '#b45309' : '#1d4ed8'),
                              fontWeight: isRowToday ? 700 : 600,
                              textDecoration: 'none',
                              lineHeight: '1.4'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                          >
                            {job.title}
                          </a>
                        </div>
                      </td>

                      {/* Organization */}
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.88rem' }}>
                        {job.organization || 'Govt Department'}
                      </td>

                      {/* Total Post */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold', color: '#047857' }}>
                        {job.totalPosts || job.vacancies || '-'}
                      </td>

                      {/* Last Date + Dynamic Status + Action */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.86rem',
                          backgroundColor: isRowToday
                            ? '#fee2e2'
                            : isRowTomorrow
                            ? '#fef3c7'
                            : '#eff6ff',
                          color: isRowToday
                            ? '#dc2626'
                            : isRowTomorrow
                            ? '#b45309'
                            : '#1e40af',
                          border: isRowToday
                            ? '1px solid #fca5a5'
                            : isRowTomorrow
                            ? '1px solid #fde68a'
                            : '1px solid #bfdbfe',
                          marginBottom: '4px'
                        }}>
                          {job.extractedLastDate}
                        </div>

                        {/* Sub-status line */}
                        <div style={{ fontSize: '0.74rem', marginBottom: '6px', fontWeight: 600 }}>
                          {isRowToday && <span style={{ color: '#dc2626' }}>Ending Today!</span>}
                          {isRowTomorrow && <span style={{ color: '#d97706' }}>1 Day Left</span>}
                          {isRowSoon && job.diffDays !== null && <span style={{ color: '#2563eb' }}>{job.diffDays} days remaining</span>}
                        </div>

                        <div>
                          {job.applyUrlDirect ? (
                            <a
                              href={job.applyUrlDirect}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem',
                                color: '#ffffff',
                                backgroundColor: isRowToday ? '#dc2626' : '#2563eb',
                                padding: '3px 10px',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                              }}
                            >
                              Apply Direct <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <a
                              href={`/${job.id}`}
                              onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                  e.preventDefault();
                                  onSelectJob(job.id);
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem',
                                color: '#ffffff',
                                backgroundColor: '#059669',
                                padding: '3px 10px',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                              }}
                            >
                              View Details
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No active jobs found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
