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

// Merged master INITIAL_JOBS array containing all posts
export const INITIAL_JOBS = [
  ...jobsData,
  ...admitCardsData,
  ...resultsData,
  ...admissionsData,
  ...syllabusData,
  ...importantData
];


