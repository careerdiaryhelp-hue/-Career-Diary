const { performance } = require('perf_hooks');
import('../src/utils/jobsService.js').then(async (m) => {
  const start = performance.now();
  await m.getAllJobsServer();
  const end = performance.now();
  console.log(`getAllJobsServer took ${end - start} ms`);
  
  const start2 = performance.now();
  await m.getAllJobsServer();
  const end2 = performance.now();
  console.log(`getAllJobsServer (cached) took ${end2 - start2} ms`);
});
