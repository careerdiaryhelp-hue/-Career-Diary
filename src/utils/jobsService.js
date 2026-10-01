import { INITIAL_JOBS } from '../data/initialJobs.js';
import { cleanJobId, fetchFirestoreJobsOnce } from '../firebase.js';

export function mergeAndSortJobs(primaryPosts = [], fallbackPosts = []) {
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const seenIds = new Set();
  const seenTitles = new Set();
  const merged = [];

  // 1. Process primary posts first (user edits & Firestore take highest priority)
  for (const post of primaryPosts) {
    if (!post || !post.title) continue;
    const safeId = post.id || post.slug || cleanJobId(post.title);
    const normTitle = normalize(post.title);

    seenIds.add(safeId);
    if (normTitle) seenTitles.add(normTitle);
    merged.push({
      ...post,
      id: safeId,
      slug: safeId
    });
  }

  // 2. Add fallback posts if not already present by ID or normalized title
  for (const post of fallbackPosts) {
    if (!post || !post.title) continue;
    const safeId = post.id || post.slug || cleanJobId(post.title);
    const normTitle = normalize(post.title);

    if (seenIds.has(safeId) || (normTitle && seenTitles.has(normTitle))) {
      continue;
    }

    seenIds.add(safeId);
    if (normTitle) seenTitles.add(normTitle);
    merged.push(post);
  }

  // 3. Sort merged posts
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

    const getTime = (j) => {
      if (j.updatedAt) {
        const t = new Date(j.updatedAt).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
      if (j.postDate) {
        const t = new Date(j.postDate).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
      return 0;
    };

    const timeA = getTime(a);
    const timeB = getTime(b);
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return 0;
  });
}

// Server-side fetching helper for Next.js SSR / Static Generation
export async function getAllJobsServer() {
  try {
    const firestorePosts = await fetchFirestoreJobsOnce();
    if (firestorePosts && firestorePosts.length > 0) {
      return mergeAndSortJobs(firestorePosts, INITIAL_JOBS);
    }
  } catch (e) {
    console.warn('Failed to fetch jobs server-side from Firestore, falling back to static:', e);
  }
  return mergeAndSortJobs([], INITIAL_JOBS);
}

export async function getJobBySlug(slug) {
  if (!slug) return null;
  const jobs = await getAllJobsServer();
  const clean = cleanJobId(slug);
  const lowerSlug = String(slug).toLowerCase().trim();

  // 1. Exact match by id or slug
  let match = jobs.find(j => {
    if (!j) return false;
    const jId = String(j.id || '').toLowerCase().trim();
    const jSlug = String(j.slug || '').toLowerCase().trim();
    return jId === clean || jSlug === clean || jId === lowerSlug || jSlug === lowerSlug;
  });
  if (match) return match;

  // 2. Loose / partial match (matching original App.jsx logic)
  match = jobs.find(j => {
    if (!j) return false;
    const jId = String(j.id || '').toLowerCase().trim();
    const jSlug = String(j.slug || '').toLowerCase().trim();
    return (jId && (jId.includes(clean) || clean.includes(jId))) ||
           (jSlug && (jSlug.includes(clean) || clean.includes(jSlug)));
  });
  if (match) return match;

  // 3. Match by normalized title
  const normSlug = clean.replace(/[^a-z0-9]/g, '');
  if (normSlug.length > 6) {
    match = jobs.find(j => {
      if (!j || !j.title) return false;
      const normTitle = String(j.title).toLowerCase().replace(/[^a-z0-9]/g, '');
      return normTitle.includes(normSlug) || normSlug.includes(normTitle);
    });
  }

  return match || null;
}
