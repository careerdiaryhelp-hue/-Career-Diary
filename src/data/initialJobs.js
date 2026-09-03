import { jobsData } from './jobsData';
import { admitCardsData } from './admitCardsData';
import { syllabusData } from './syllabusData';
import { resultsData } from './resultsData';
import { admissionsData } from './admissionsData';
import { importantData } from './importantData';

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


