import { mergeAndSortJobs } from '../src/utils/jobsService.js';
import { precomputedFullJobs } from '../src/data/precomputed_full.js';

let start = performance.now();
mergeAndSortJobs([], precomputedFullJobs);
console.log("mergeAndSortJobs on", precomputedFullJobs.length, "items took:", performance.now() - start, "ms");
