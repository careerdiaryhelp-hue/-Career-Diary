import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const { jobsData } = await import('../src/data/jobsData.js');
  const { admitCardsData } = await import('../src/data/admitCardsData.js');
  const { resultsData } = await import('../src/data/resultsData.js');
  const { admissionsData } = await import('../src/data/admissionsData.js');
  const { syllabusData } = await import('../src/data/syllabusData.js');
  const { importantData } = await import('../src/data/importantData.js');

  function cleanJobId(id) {
    if (!id) return '';
    return String(id)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function summarizeJobForList(job) {
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

  function mergeAndSortJobs(primaryPosts = [], fallbackPosts = []) {
    const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const seenIds = new Set();
    const seenTitles = new Set();
    const merged = [];

    for (const post of primaryPosts) {
      if (!post || !post.title) continue;
      const safeId = post._safeId || post.id || post.slug || cleanJobId(post.title);
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
      merged.push({ ...post, id: safeId, slug: safeId, _safeId: safeId, _normTitle: normTitle, _ts });
    }

    for (const post of fallbackPosts) {
      if (!post || !post.title) continue;
      const safeId = post._safeId || post.id || post.slug || cleanJobId(post.title);
      const normTitle = post._normTitle || normalize(post.title);
      if (seenIds.has(safeId) || (normTitle && seenTitles.has(normTitle))) continue;
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
      if (timeA !== timeB) return timeB - timeA;
      return 0;
    });
  }

  let firestoreJobs = [];
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents:runQuery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'jobs' }],
          orderBy: [{ field: { fieldPath: 'updatedAt' }, direction: 'DESCENDING' }],
          limit: 100
        }
      })
    });
    if (res.ok) {
      const data = await res.json();
      function parseVal(val) {
        if (!val) return null;
        if ('stringValue' in val) return val.stringValue;
        if ('integerValue' in val) return Number(val.integerValue);
        if ('doubleValue' in val) return Number(val.doubleValue);
        if ('booleanValue' in val) return val.booleanValue;
        if ('timestampValue' in val) return val.timestampValue;
        if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseVal);
        if ('mapValue' in val) {
          const r = {};
          for (const [k, v] of Object.entries(val.mapValue.fields || {})) r[k] = parseVal(v);
          return r;
        }
        return null;
      }
      firestoreJobs = data
        .filter(item => item && item.document && item.document.fields)
        .map(item => {
          const doc = item.document;
          const fields = {};
          for (const [k, v] of Object.entries(doc.fields || {})) fields[k] = parseVal(v);
          const id = doc.name.split('/').pop();
          return { id, ...fields };
        });
      console.log(`Fetched ${firestoreJobs.length} full live jobs from Firestore for precomputation.`);
    }
  } catch (err) {
    console.warn("Could not fetch full Firestore jobs, falling back to fetchFirestoreJobsOnce:", err?.message || err);
    try {
      const { fetchFirestoreJobsOnce } = await import('../src/firebase.js');
      firestoreJobs = await fetchFirestoreJobsOnce();
    } catch (_) {}
  }

  let existingPrecomputedJobs = [];
  try {
    const { precomputedFullJobs } = await import('../src/data/precomputed_full.js');
    if (Array.isArray(precomputedFullJobs)) {
      existingPrecomputedJobs = precomputedFullJobs;
    }
  } catch (_) {}

  const initialJobs = [
    ...jobsData, ...admitCardsData, ...resultsData, ...admissionsData, ...syllabusData, ...importantData
  ];

  // Merge live firestore jobs with existing precomputed jobs (so 429 quota exhaustion never loses posts)
  const combinedPrimary = mergeAndSortJobs(firestoreJobs, existingPrecomputedJobs);
  const SORTED_STATIC_JOBS = mergeAndSortJobs(combinedPrimary, initialJobs);
  const SORTED_STATIC_SUMMARY = SORTED_STATIC_JOBS.map(summarizeJobForList);

  fs.writeFileSync(
    path.join(__dirname, '../src/data/precomputed_summary.js'),
    `export const precomputedSummary = ${JSON.stringify(SORTED_STATIC_SUMMARY)};`
  );

  fs.writeFileSync(
    path.join(__dirname, '../src/data/precomputed_full.js'),
    `export const precomputedFullJobs = ${JSON.stringify(SORTED_STATIC_JOBS)};`
  );

  console.log(`Precomputed ${SORTED_STATIC_JOBS.length} jobs summary and full array into JS files.`);
})();
