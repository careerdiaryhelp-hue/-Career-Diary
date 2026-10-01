import { getInitialJobs } from '../data/initialJobs.js';
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
    bannerColor: job.bannerColor || '',
    pinned: !!job.pinned,
    displayOrder: job.displayOrder || 0,
    order: job.order || 0,
    state: job.state || 'All India',
    status: job.status || 'Active Notification',
    shortInfo: job.shortInfo || '',
    importantDates: job.importantDates || null,
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
    const safeId = post._safeId || post.id || post.slug || cleanJobId(post.title);
    const normTitle = post._normTitle || normalize(post.title);

    seenIds.add(safeId);
    if (normTitle) seenTitles.add(normTitle);
    
    let _ts = post._ts;
    if (_ts === undefined) {
      if (post.updatedAt) _ts = new Date(post.updatedAt).getTime();
      if ((isNaN(_ts) || _ts === 0) && post.postDate) _ts = new Date(post.postDate).getTime();
      if (isNaN(_ts)) _ts = 0;
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
    const safeId = post._safeId || post.id || post.slug || cleanJobId(post.title);
    const normTitle = post._normTitle || normalize(post.title);

    if (seenIds.has(safeId) || (normTitle && seenTitles.has(normTitle))) {
      continue;
    }

    seenIds.add(safeId);
    if (normTitle) seenTitles.add(normTitle);

    let _ts = post._ts;
    if (_ts === undefined) {
      if (post.updatedAt) _ts = new Date(post.updatedAt).getTime();
      if ((isNaN(_ts) || _ts === 0) && post.postDate) _ts = new Date(post.postDate).getTime();
      if (isNaN(_ts)) _ts = 0;
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

// Lazy-initialized static data — deferred from module load to first access
// to keep cold-start CPU time under Cloudflare Worker limits.
let _staticJobsReady = false;
let SORTED_STATIC_JOBS = null;
let SORTED_STATIC_SUMMARY = null;
let STATIC_SLUG_MAP = null;

function ensureStaticData() {
  if (_staticJobsReady) return;
  SORTED_STATIC_JOBS = mergeAndSortJobs([], getInitialJobs());
  SORTED_STATIC_SUMMARY = SORTED_STATIC_JOBS.map(summarizeJobForList);
  STATIC_SLUG_MAP = buildSlugMap(SORTED_STATIC_JOBS);
  _staticJobsReady = true;
}

// In-memory cache for Cloudflare Worker instances
let _cachedFullJobs = null;
let _cachedSummaryJobs = null;
let _cachedTime = 0;
let _slugMap = null;

function buildSlugMap(jobs) {
  const map = new Map();
  for (const j of jobs) {
    if (!j) continue;
    if (j.id) map.set(String(j.id).toLowerCase().trim(), j);
    if (j.slug) map.set(String(j.slug).toLowerCase().trim(), j);
    if (j.title) {
      const clean = j._safeId || cleanJobId(j.title);
      map.set(clean, j);
      map.set(String(j.title).toLowerCase().trim(), j);
    }
  }
  return map;
}

// Fast cached getter for Full Jobs (includes content, cached for 60s)
export async function getAllJobsFullServer() {
  ensureStaticData();
  const now = Date.now();
  if (_cachedFullJobs && (now - _cachedTime < 60000)) {
    return _cachedFullJobs;
  }

  try {
    const firestorePosts = await fetchFirestoreJobsOnce();
    if (firestorePosts && firestorePosts.length > 0) {
      _cachedFullJobs = mergeAndSortJobs(firestorePosts, SORTED_STATIC_JOBS);
      _cachedSummaryJobs = _cachedFullJobs.map(summarizeJobForList);
      _slugMap = buildSlugMap(_cachedFullJobs);
      _cachedTime = now;
      return _cachedFullJobs;
    }
  } catch (e) {
    console.warn('Failed to fetch jobs server-side from Firestore, falling back to static:', e.message);
  }

  _cachedFullJobs = SORTED_STATIC_JOBS;
  _cachedSummaryJobs = SORTED_STATIC_SUMMARY;
  _slugMap = STATIC_SLUG_MAP;
  _cachedTime = now;
  return _cachedFullJobs;
}

// Server-side fetching helper for Next.js SSR / Static Generation
// Returns lightweight summarized jobs to keep RSC payload under 100KB (instead of 3MB!)
export async function getAllJobsServer() {
  ensureStaticData();
  const now = Date.now();
  if (_cachedSummaryJobs && (now - _cachedTime < 60000)) {
    return _cachedSummaryJobs;
  }
  try {
    await getAllJobsFullServer();
  } catch (e) {}
  return _cachedSummaryJobs || SORTED_STATIC_SUMMARY;
}

// Fast helper for detail pages to get only the top N recent jobs for related posts sidebar (3KB payload!)
export async function getTopRecentJobsSummary(limit = 15) {
  const jobs = await getAllJobsServer();
  return jobs.slice(0, limit);
}

// Ultra-fast O(1) slug lookup for single job post pages (<0.005ms CPU time)
export async function getJobBySlug(slug) {
  if (!slug) return null;
  ensureStaticData();
  const clean = cleanJobId(slug);
  const lowerSlug = String(slug).toLowerCase().trim();

  // 1. FAST PATH: Check static bundled posts FIRST (instant memory lookup, 0.005ms, ZERO network)
  let match = STATIC_SLUG_MAP.get(clean) || STATIC_SLUG_MAP.get(lowerSlug);
  if (match) return match;

  // 2. Check dynamic Firestore cache if already loaded
  if (_slugMap) {
    match = _slugMap.get(clean) || _slugMap.get(lowerSlug);
    if (match) return match;
  }

  // 3. Fallback 1: Fuzzy match in full list (for older mismatched URLs)
  const fullJobs = _cachedFullJobs || SORTED_STATIC_JOBS;
  match = fullJobs.find(j => {
    if (!j) return false;
    const jId = String(j.id || '').toLowerCase().trim();
    const jSlug = String(j.slug || '').toLowerCase().trim();
    return (jId && (jId.includes(clean) || clean.includes(jId))) ||
           (jSlug && (jSlug.includes(clean) || clean.includes(jSlug)));
  });
  if (match) return match;

  // 4. Fallback 2: If not in static posts, load Firestore
  try {
    await getAllJobsFullServer();
    if (_slugMap) {
      match = _slugMap.get(clean) || _slugMap.get(lowerSlug);
      if (match) return match;
    }
    const directDoc = await fetchFirestoreJobById(clean);
    if (directDoc) return directDoc;
  } catch (e) {}

  return null;
}
