import { getJobBySlug } from './src/utils/jobsService.js';
async function run() {
  const job = await getJobBySlug('rajasthan-state-eligibility-test-set-online-form-2026');
  console.log(JSON.stringify(job, null, 2));
}
run();
