// Removed synchronous imports to prevent Cloudflare Worker 1102 bundle size crash.
// The large static data arrays are now dynamically imported and code-split.

let _initialJobsPromise = null;

export function getInitialJobs() {
  if (!_initialJobsPromise) {
    _initialJobsPromise = Promise.all([
      import('./jobsData.js').then(m => m.jobsData),
      import('./admitCardsData.js').then(m => m.admitCardsData),
      import('./resultsData.js').then(m => m.resultsData),
      import('./admissionsData.js').then(m => m.admissionsData),
      import('./syllabusData.js').then(m => m.syllabusData),
      import('./importantData.js').then(m => m.importantData)
    ]).then(arrays => arrays.flat());
  }
  return _initialJobsPromise;
}

export { getInitialJobs as INITIAL_JOBS };
