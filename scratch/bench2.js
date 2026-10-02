import { precomputedFullJobs } from '../src/data/precomputed_full.js';
import { summarizeJobForList } from '../src/utils/jobsService.js';

let start = performance.now();
let summaries = precomputedFullJobs.map(summarizeJobForList);
console.log("summarizeJobForList on", precomputedFullJobs.length, "items took:", performance.now() - start, "ms");
