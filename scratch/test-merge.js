const { mergeAndSortJobs } = require('./src/utils/jobsService.js');

const staticJobs = [];
for (let i = 0; i < 2000; i++) {
  staticJobs.push({
    id: 'job-' + i,
    title: 'Title for job ' + i,
    content: 'A'.repeat(30000), // 30kb content
    postDate: new Date().toISOString()
  });
}

const firestoreJobs = [];
for (let i = 0; i < 150; i++) {
  firestoreJobs.push({
    id: 'fs-job-' + i,
    title: 'Title for FS job ' + i,
    postDate: new Date().toISOString()
  });
}

console.time("mergeAndSortJobs");
const merged = mergeAndSortJobs(firestoreJobs, staticJobs);
console.timeEnd("mergeAndSortJobs");
