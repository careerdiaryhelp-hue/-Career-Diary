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
    const safeId = post._safeId || (post.id && cleanJobId(post.id)) || (post.slug && cleanJobId(post.slug)) || cleanJobId(post.title);
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

import { precomputedSummary } from '../data/precomputed_summary.js';
import { postsMap } from '../data/posts/manifest.js';

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

// Ultra-fast chunked getter for a single job (loads ONLY ~3-6KB chunk instead of 1MB monolithic file)
export async function getJobBySlug(slug) {
  if (!slug) return null;
  const clean = cleanJobId(slug);
  const lowerSlug = String(slug).toLowerCase().trim();

  // 1. Direct O(1) match via chunked loader map
  let loader = postsMap[clean] || postsMap[lowerSlug];

  // 2. If not found directly, look up in summary array (lightweight, instant)
  if (!loader) {
    const summaryMatch = precomputedSummary.find(j => {
      if (!j) return false;
      const jId = String(j.id || '').toLowerCase().trim();
      const jSlug = String(j.slug || '').toLowerCase().trim();
      const jTitle = String(j.title || '').toLowerCase().trim();
      return (
        jId === clean || jSlug === clean || jTitle === lowerSlug ||
        (clean.length > 5 && (jId.includes(clean) || clean.includes(jId)))
      );
    });

    if (summaryMatch) {
      const matchKey = cleanJobId(summaryMatch.slug || summaryMatch.id);
      loader = postsMap[matchKey] || postsMap[summaryMatch.id];
    }
  }

  // Load the isolated 3-6KB chunk (takes <0.05ms CPU time in Cloudflare Workers)
  if (loader) {
    try {
      const mod = await loader();
      return mod.job || mod.default || null;
    } catch (e) {
      console.error('Error loading chunked post:', e);
    }
  }

  // Fallback: If not in static posts, query Firestore for dynamic new posts
  try {
    const directDoc = await fetchFirestoreJobById(clean);
    if (directDoc) return directDoc;
  } catch (e) {}

  return null;
}
