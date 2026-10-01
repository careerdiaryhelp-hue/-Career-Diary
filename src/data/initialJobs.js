import { jobsData } from './jobsData.js';
import { admitCardsData } from './admitCardsData.js';
import { syllabusData } from './syllabusData.js';
import { resultsData } from './resultsData.js';
import { admissionsData } from './admissionsData.js';
import { importantData } from './importantData.js';

// Export individual category data files
export {
  jobsData,
  admitCardsData,
  syllabusData,
  resultsData,
  admissionsData,
  importantData
};

// Lazy-computed merged master array — deferred from module load to first access
// to avoid spreading ~1MB of arrays during cold-start module evaluation.
let _initialJobs = null;
export function getInitialJobs() {
  if (!_initialJobs) {
    _initialJobs = [
      ...jobsData,
      ...admitCardsData,
      ...resultsData,
      ...admissionsData,
      ...syllabusData,
      ...importantData
    ];
  }
  return _initialJobs;
}

// Keep backward-compatible named export for any other consumers
// (uses a getter so it's lazy too)
export { _initialJobs as INITIAL_JOBS };
