// Removed sync initialJobs import to prevent worker bundle bloat
import { cleanJobId, fetchFirestoreJobsOnce, fetchFirestoreJobById } from '../firebase.js';

export { cleanJobId };

// Lightweight summarizer for lists, grids, tickers, and related post links.
// Strips massive full-HTML tables and paragraphs (reduces payload by >96%, preventing Cloudflare Worker Error 1102).
export function summarizeJobForList(job) {
  if (!job) return null;
  return {
    id: job.id,
    slug: job.slug || job.id,
    title: job.title,
    postName: job.postName || job.title,
    organization: job.organization || '',
    category: job.category || '',
    badge: job.badge || '',
    postDate: job.postDate || '',
    updatedAt: job.updatedAt || '',
    lastDate: job.lastDate || job.appLast || job.importantDates?.lastDate || '',
    appLast: job.appLast || job.lastDate || '',
    appStart: job.appStart || '',
    featured: !!(job.featured || job.isFeatured),
    isFeatured: !!(job.featured || job.isFeatured),
    isTopCard: !!job.isTopCard,
    isLatest: !!job.isLatest,
    isLatestUpdate: !!job.isLatestUpdate,
    isBreakingNews: !!job.isBreakingNews,
    isTopForm: !!job.isTopForm,
    bannerColor: job.bannerColor || '',
    pinned: !!job.pinned,
    displayOrder: job.displayOrder || 0,
    latestOrder: job.latestOrder || 0,
    featuredOrder: job.featuredOrder || 0,
    order: job.order || 0,
    state: job.state || 'All India',
    status: job.status || 'Active Notification',
    shortInfo: job.shortInfo || '',
    importantDates: job.importantDates || null,
    secondaryCategories: job.secondaryCategories || [],
  };
}

export function mergeAndSortJobs(primaryPosts = [], fallbackPosts = []) {
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const seenIds = new Set();
  const seenTitles = new Set();
  const merged = [];

  // 1. Process primary posts first (user edits & Firestore take highest priority)
  for (const post of primaryPosts) {
    if (!post || !post.title) continue;
    const safeId = post._safeId || (post.id && cleanJobId(post.id)) || (post.slug && cleanJobId(post.slug)) || cleanJobId(post.title);
    const normTitle = post._normTitle || normalize(post.title);

    seenIds.add(safeId);
    if (normTitle) seenTitles.add(normTitle);
    
    let _ts = 0;
    if (post.updatedAt) {
      const parsed = new Date(post.updatedAt).getTime();
      if (!isNaN(parsed) && parsed > 0) _ts = parsed;
    }
    if (_ts === 0 && post.postDate) {
      const parsed = new Date(post.postDate).getTime();
      if (!isNaN(parsed) && parsed > 0) _ts = parsed;
    }
    if (_ts === 0 && post._ts) {
      const parsed = Number(post._ts);
      if (!isNaN(parsed) && parsed > 0) _ts = parsed;
    }

    merged.push({
      ...post,
      id: safeId,
      slug: safeId,
      _safeId: safeId,
      _normTitle: normTitle,
      _ts
    });
  }

  // 2. Add fallback posts if not already present by ID or normalized title
  for (const post of fallbackPosts) {
    if (!post || !post.title) continue;
    const safeId = post._safeId || (post.id && cleanJobId(post.id)) || (post.slug && cleanJobId(post.slug)) || cleanJobId(post.title);
    const normTitle = post._normTitle || normalize(post.title);

    if (seenIds.has(safeId) || (normTitle && seenTitles.has(normTitle))) {
      continue;
    }

    seenIds.add(safeId);
    if (normTitle) seenTitles.add(normTitle);

    let _ts = 0;
    if (post.updatedAt) {
      const parsed = new Date(post.updatedAt).getTime();
      if (!isNaN(parsed) && parsed > 0) _ts = parsed;
    }
    if (_ts === 0 && post.postDate) {
      const parsed = new Date(post.postDate).getTime();
      if (!isNaN(parsed) && parsed > 0) _ts = parsed;
    }
    if (_ts === 0 && post._ts) {
      const parsed = Number(post._ts);
      if (!isNaN(parsed) && parsed > 0) _ts = parsed;
    }

    merged.push({ ...post, _ts, _safeId: safeId, _normTitle: normTitle });
  }

  // 3. Sort merged posts using precomputed timestamps
  return merged.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const orderA = Number(a.displayOrder) || Number(a.order) || 0;
    const orderB = Number(b.displayOrder) || Number(b.order) || 0;

    if (orderA > 0 && orderB > 0) {
      if (orderA !== orderB) return orderA - orderB;
    } else if (orderA > 0 && orderB === 0) {
      return -1;
    } else if (orderA === 0 && orderB > 0) {
      return 1;
    }

    const timeA = a._ts || 0;
    const timeB = b._ts || 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return 0;
  });
}

import { precomputedSummary } from '../data/precomputed_summary.js';

let FULL_JOBS_CACHE = null;

async function getFullJobs() {
  if (!FULL_JOBS_CACHE) {
    const { precomputedFullJobs } = await import('../data/precomputed_full.js');
    FULL_JOBS_CACHE = precomputedFullJobs;
  }
  return FULL_JOBS_CACHE;
}

// Server-side fetching helper for Next.js SSR / Static Generation
// Returns lightweight precomputed summary instantly (<0.01ms CPU time, 0 network, no Cloudflare 1102 errors)
export async function getAllJobsServer() {
  return precomputedSummary;
}

// Fast helper for detail pages to get only the top N recent jobs for related posts sidebar (3KB payload!)
export async function getTopRecentJobsSummary(limit = 15) {
  const jobs = await getAllJobsServer();
  return jobs.slice(0, limit);
}

export async function getJobBySlug(slug) {
  if (!slug) return null;
  const clean = cleanJobId(slug);
  const lowerSlug = String(slug).toLowerCase().trim();

  // 1. Check live Firestore doc first (ensures edits in admin immediately appear with full HTML content)
  try {
    const directDoc = await fetchFirestoreJobById(clean);
    if (directDoc && (directDoc.content || directDoc.htmlContent || directDoc.title)) {
      return directDoc;
    }
  } catch (e) {}

  const fullJobs = await getFullJobs();

  let match = fullJobs.find(j => {
    if (!j) return false;
    if (j._safeId === clean) return true;
    const jId = String(j.id || '').toLowerCase().trim();
    if (jId === clean || jId === lowerSlug) return true;
    const jSlug = String(j.slug || '').toLowerCase().trim();
    if (jSlug === clean || jSlug === lowerSlug) return true;
    const jTitle = String(j.title || '').toLowerCase().trim();
    if (jTitle === lowerSlug) return true;
    return false;
  });

  if (match) return match;

  // Fallback 1: Fuzzy match in full list (for older mismatched URLs)
  match = fullJobs.find(j => {
    if (!j) return false;
    const jId = String(j.id || '').toLowerCase().trim();
    const jSlug = String(j.slug || '').toLowerCase().trim();
    return (jId && (jId.includes(clean) || clean.includes(jId))) ||
           (jSlug && (jSlug.includes(clean) || clean.includes(jSlug)));
  });
  if (match) return match;

  // Fallback 2: If not in static posts, query Firestore for dynamic new posts
  try {
    const directDoc = await fetchFirestoreJobById(clean);
    if (directDoc) return directDoc;
  } catch (e) {}

  return null;
}
