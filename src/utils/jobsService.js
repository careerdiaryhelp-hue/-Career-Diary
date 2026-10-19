import { cache } from 'react';
// Removed sync initialJobs import to prevent worker bundle bloat
import { cleanJobId, fetchFirestoreJobsOnce, fetchFirestoreJobById } from '../firebase.js';

export { cleanJobId };

// Returns the full absolute URL for OpenGraph / WhatsApp / Telegram sharing preview
export function getSocialImageUrl(job, slug = '') {
  if (!job) return 'https://careerdiary.in/image.png';
  const img = job.faqImage || job.postImage || job.bannerImage || job.image || job.thumbnail;
  if (!img) return 'https://careerdiary.in/image.png';

  const trimmed = String(img).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `https://careerdiary.in${trimmed}`;
  }

  if (trimmed.startsWith('data:image/')) {
    const safeSlug = job.slug || job.id || slug;
    return `https://careerdiary.in/api/post-image/${encodeURIComponent(cleanJobId(safeSlug))}`;
  }

  return 'https://careerdiary.in/image.png';
}

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
    postUpdateDate: job.postUpdateDate || job.updateDate || '',
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
  return (Array.isArray(jobs) ? jobs : [])
    .filter(j => j && j.title && j.status !== 'Draft' && j.status !== 'draft')
    .slice(0, limit);
}

// React cache deduplicates calls within the same request lifecycle (e.g. generateMetadata + Page)
export const getJobBySlug = cache(async (slug) => {
  if (!slug) return null;
  const clean = cleanJobId(slug);
  const lowerSlug = String(slug).toLowerCase().trim();

  const isDraft = (j) => j && (j.status === 'Draft' || j.status === 'draft');

  const fullJobs = await getFullJobs();

  // 1. Direct match on clean, slug, title, or aliases in static database
  let match = fullJobs.find(j => {
    if (!j) return false;
    if (j._safeId === clean) return true;
    const jId = String(j.id || '').toLowerCase().trim();
    if (jId === clean || jId === lowerSlug) return true;
    const jSlug = String(j.slug || '').toLowerCase().trim();
    if (jSlug === clean || jSlug === lowerSlug) return true;
    const jTitle = String(j.title || '').toLowerCase().trim();
    if (jTitle === lowerSlug) return true;
    if (Array.isArray(j.aliases) && j.aliases.some(a => {
      const ca = cleanJobId(a);
      return ca === clean || ca === lowerSlug;
    })) return true;
    return false;
  });

  // 2. Loose / Normalized match (removes filler terms like -notice, -out, -now, etc.)
  if (!match) {
    const stripFiller = (str) =>
      String(str || '')
        .toLowerCase()
        .replace(/-(notice|recruitment|online-form|form|out|now|download|check)/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

    const normClean = stripFiller(clean);
    if (normClean) {
      match = fullJobs.find(j => {
        if (!j) return false;
        const jSlugNorm = stripFiller(j.slug || j.id);
        return jSlugNorm && jSlugNorm === normClean;
      });
    }
  }

  // 3. Fallback: Fuzzy match in static jobs
  if (!match) {
    match = fullJobs.find(j => {
      if (!j) return false;
      const jId = String(j.id || '').toLowerCase().trim();
      const jSlug = String(j.slug || '').toLowerCase().trim();
      return (jId && (jId.includes(clean) || clean.includes(jId))) ||
             (jSlug && (jSlug.includes(clean) || clean.includes(jSlug)));
    });
  }

  // 4. If matched in static jobs: check targeted single document in Firestore (only 1 read, negative cached 10m)
  // Ensures admin edits and uploaded FAQ images appear without reading 35 documents on every page view!
  if (match) {
    try {
      const liveDoc = await fetchFirestoreJobById(clean);
      if (liveDoc) {
        if (isDraft(liveDoc)) return null;
        return {
          ...match,
          ...liveDoc,
          content: liveDoc.content || liveDoc.htmlContent || match.content,
          htmlContent: liveDoc.htmlContent || liveDoc.content || match.htmlContent,
          faqImage: liveDoc.faqImage || liveDoc.postImage || liveDoc.bannerImage || match.faqImage || '',
          postImage: liveDoc.postImage || liveDoc.faqImage || liveDoc.bannerImage || match.postImage || '',
          bannerImage: liveDoc.bannerImage || liveDoc.faqImage || liveDoc.postImage || match.bannerImage || '',
          faqImageLink: liveDoc.faqImageLink || match.faqImageLink || '',
          faqImageCaption: liveDoc.faqImageCaption || match.faqImageCaption || '',
        };
      }
    } catch (_) {}
    return isDraft(match) ? null : match;
  }

  // 5. If not in static database: query Firestore single document by ID (1 read, edge cached)
  try {
    const directDoc = await fetchFirestoreJobById(clean);
    if (directDoc && (directDoc.content || directDoc.htmlContent || directDoc.title)) {
      return isDraft(directDoc) ? null : directDoc;
    }
  } catch (_) {}

  // 6. Last resort fallback for newly published post with custom slug
  try {
    const liveJobs = await fetchFirestoreJobsOnce();
    const liveMatch = liveJobs.find(j => {
      if (!j) return false;
      const jId = cleanJobId(j.id || '');
      const jSlug = cleanJobId(j.slug || '');
      return jId === clean || jSlug === clean;
    });
    if (liveMatch && !isDraft(liveMatch)) {
      return liveMatch;
    }
  } catch (_) {}

  return null;
});
