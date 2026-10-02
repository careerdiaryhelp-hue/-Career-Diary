import { getAllJobsFullServer, getAllJobsServer, getJobBySlug } from '../src/utils/jobsService.js';

async function run() {
  console.log("Starting benchmark...");
  let start = performance.now();
  await getAllJobsFullServer();
  console.log("getAllJobsFullServer() took:", performance.now() - start, "ms");

  start = performance.now();
  await getAllJobsServer();
  console.log("getAllJobsServer() took:", performance.now() - start, "ms");

  start = performance.now();
  await getJobBySlug("latest-job");
  console.log("getJobBySlug('latest-job') took:", performance.now() - start, "ms");
}
run();
