import { jobsData } from './jobsData';
import { admitCardsData } from './admitCardsData';
import { syllabusData } from './syllabusData';
import { resultsData } from './resultsData';
import { admissionsData } from './admissionsData';
import { importantData } from './importantData';

// Export individual category data files for modular consumption
export {
  jobsData,
  admitCardsData,
  syllabusData,
  resultsData,
  admissionsData,
  importantData
};

// Merged master INITIAL_JOBS array for the entire application
export const INITIAL_JOBS = [
  ...jobsData,
  ...admitCardsData,
  ...syllabusData,
  ...resultsData,
  ...admissionsData,
  ...importantData
];
