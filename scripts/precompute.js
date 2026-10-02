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
      let _ts = post._ts;
      if (_ts === undefined) {
        if (post.updatedAt) _ts = new Date(post.updatedAt).getTime();
        if ((isNaN(_ts) || _ts === 0) && post.postDate) _ts = new Date(post.postDate).getTime();
        if (isNaN(_ts)) _ts = 0;
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
      let _ts = post._ts;
      if (_ts === undefined) {
        if (post.updatedAt) _ts = new Date(post.updatedAt).getTime();
        if ((isNaN(_ts) || _ts === 0) && post.postDate) _ts = new Date(post.postDate).getTime();
        if (isNaN(_ts)) _ts = 0;
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

  const initialJobs = [
    ...jobsData, ...admitCardsData, ...resultsData, ...admissionsData, ...syllabusData, ...importantData
  ];

  const SORTED_STATIC_JOBS = mergeAndSortJobs([], initialJobs);
  const SORTED_STATIC_SUMMARY = SORTED_STATIC_JOBS.map(summarizeJobForList);

  fs.writeFileSync(
    path.join(__dirname, '../src/data/precomputed_summary.js'),
    `export const precomputedSummary = ${JSON.stringify(SORTED_STATIC_SUMMARY)};`
  );

  fs.writeFileSync(
    path.join(__dirname, '../src/data/precomputed_full.js'),
    `export const precomputedFullJobs = ${JSON.stringify(SORTED_STATIC_JOBS)};`
  );

  // Generate per-job chunked files in src/data/posts to eliminate the 1MB monolithic bundle
  const postsDir = path.join(__dirname, '../src/data/posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const manifestEntries = [];
  const registeredKeys = new Set();

  for (const job of SORTED_STATIC_JOBS) {
    if (!job || !job._safeId) continue;
    const safeId = job._safeId;
    const filePath = path.join(postsDir, `${safeId}.js`);
    fs.writeFileSync(filePath, `export const job = ${JSON.stringify(job)};\n`);

    const keys = [safeId];
    if (job.id && job.id !== safeId) keys.push(cleanJobId(job.id));
    if (job.slug && job.slug !== safeId) keys.push(cleanJobId(job.slug));

    for (const k of keys) {
      if (!k || registeredKeys.has(k)) continue;
      registeredKeys.add(k);
      manifestEntries.push(`  ${JSON.stringify(k)}: () => import('./${safeId}.js')`);
    }
  }

  fs.writeFileSync(
    path.join(postsDir, 'manifest.js'),
    `// Auto-generated per-job lazy loader manifest\nexport const postsMap = {\n${manifestEntries.join(',\n')}\n};\n`
  );

  console.log(`Precomputed ${SORTED_STATIC_JOBS.length} chunked jobs into src/data/posts/ and generated manifest.`);
})();
