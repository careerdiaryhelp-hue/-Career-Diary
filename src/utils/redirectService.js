import { getQuizSetBySlug, QUIZ_SETS } from '../data/quizRegistry';
import { fetchTestSeriesBySlug, fetchTestSeriesOnce, fetchPyqBySlug, cleanJobId } from '../firebase';
import { getJobBySlug } from './jobsService';
import { getJobUrl } from '../data/categoryHelpers';

/**
 * Resolves the target URL for a given slug.
 * Checks Test Series, PYQ, and Jobs database.
 * If the current route prefix does not match the canonical destination,
 * returns the full canonical path for redirection.
 */
export async function resolveDestinationUrl(slug, currentPrefix = 'job') {
  if (!slug) return null;
  const clean = cleanJobId(slug);
  const lowerSlug = String(slug).toLowerCase().trim();

  // 1. Check if it matches a static Quiz / Test Series
  const staticQuiz = getQuizSetBySlug(slug) || QUIZ_SETS.find(s => {
    const sId = s.id.toLowerCase();
    const sSlug = s.slug.toLowerCase();
    return sId === clean || sSlug === clean || sId === lowerSlug || sSlug === lowerSlug ||
           sId.replace(/[-_]/g, '') === clean.replace(/[-_]/g, '');
  });
  if (staticQuiz) {
    return staticQuiz.urlPath || `/test-series/${staticQuiz.examSlug}/${staticQuiz.setSlug}`;
  }

  // 2. Check if it matches a dynamic Test Series in Firestore
  try {
    const dynamicTs = await fetchTestSeriesBySlug(slug);
    if (dynamicTs) {
      if (dynamicTs.permalink && typeof dynamicTs.permalink === 'string') {
        return dynamicTs.permalink;
      }
      const examSlug = dynamicTs.examSlug || cleanJobId(dynamicTs.exam || 'bssc-cgl');
      const setSlug = dynamicTs.setSlug || cleanJobId(dynamicTs.set || clean.replace(/^ts_/, '') || 'set1');
      return `/test-series/${examSlug}/${setSlug}`;
    }
  } catch (_) {}

  // Also check master list of test series
  try {
    const allTs = await fetchTestSeriesOnce();
    const foundTs = (allTs || []).find((t) => {
      if (!t) return false;
      const tId = cleanJobId(t.id || '');
      const tSlug = cleanJobId(t.slug || '');
      return tId === clean || tSlug === clean || tId.replace(/^ts_/, '') === clean || clean === cleanJobId(t.title);
    });
    if (foundTs) {
      if (foundTs.permalink) return foundTs.permalink;
      const examSlug = foundTs.examSlug || cleanJobId(foundTs.exam || 'bssc-cgl');
      const setSlug = foundTs.setSlug || cleanJobId(foundTs.set || clean.replace(/^ts_/, '') || 'set1');
      return `/test-series/${examSlug}/${setSlug}`;
    }
  } catch (_) {}

  // 3. Check if it matches a PYQ post
  try {
    const pyq = await fetchPyqBySlug(slug);
    if (pyq) {
      return `/pyq/${cleanJobId(pyq.slug || pyq.id || slug).replace(/^pyq_/, '')}`;
    }
  } catch (_) {}

  // 4. Check if it matches a Job/Notification and verify category prefix
  try {
    const job = await getJobBySlug(slug);
    if (job) {
      const canonicalUrl = getJobUrl(job);
      const curPrefixNorm = currentPrefix.replace(/^\/+|\/+$/g, '').toLowerCase();
      const canonicalPrefix = canonicalUrl.split('/')[1] || '';
      if (curPrefixNorm !== canonicalPrefix) {
        return canonicalUrl;
      }
    }
  } catch (_) {}

  return null;
}
