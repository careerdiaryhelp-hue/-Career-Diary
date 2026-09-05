// Centralized category classification helpers and column configurations for Career Diary

export const isAnswerKey = (j) => {
  if (!j) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'ANSWER KEY' || cat === 'ANSKEY') return true;
  const title = (j.title || '').toLowerCase();
  return (
    title.includes('answer key') ||
    title.includes('ans key') ||
    title.includes('response sheet') ||
    title.includes('answer sheet') ||
    (cat.includes('ANSWER') && !cat.includes('RESULT'))
  );
};

export const isResult = (j) => {
  if (!j) return false;
  if (isAnswerKey(j)) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'RESULT') return true;
  const title = (j.title || '').toLowerCase();
  return (
    cat.includes('RESULT') ||
    title.includes('result') ||
    title.includes('marks') ||
    title.includes('merit list') ||
    title.includes('score card') ||
    title.includes('cut off')
  );
};

export const isAdmitCard = (j) => {
  if (!j) return false;
  if (isResult(j) || isAnswerKey(j)) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'ADMIT CARD' || cat === 'ADMIT') return true;
  const title = (j.title || '').toLowerCase();
  return (
    cat.includes('ADMIT') ||
    title.includes('admit card') ||
    title.includes('hall ticket') ||
    title.includes('exam city') ||
    title.includes('application status')
  );
};

export const isLatestJob = (j) => {
  if (!j) return false;
  if (isAdmitCard(j) || isResult(j) || isAnswerKey(j)) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'LATEST JOB' || cat === 'LATEST JOBS' || cat === 'JOB') return true;
  const title = (j.title || '').toLowerCase();
  return (
    cat.includes('JOB') ||
    cat.includes('RECRUITMENT') ||
    title.includes('recruitment') ||
    title.includes('vacancy') ||
    title.includes('online form') ||
    title.includes('apply online')
  );
};

export const isAdmission = (j) => {
  if (!j) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'ADMISSION' || cat === 'ADMISSIONS') return true;
  const title = (j.title || '').toLowerCase();
  return cat.includes('ADMISSION') || title.includes('admission') || title.includes('entrance');
};

export const isSyllabus = (j) => {
  if (!j) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'SYLLABUS') return true;
  const title = (j.title || '').toLowerCase();
  return cat.includes('SYLLABUS') || title.includes('syllabus') || title.includes('exam pattern');
};

export const isDocument = (j) => {
  if (!j) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'DOCUMENTS' || cat === 'DOCUMENT' || cat === 'CERTIFICATE VERIFICATION') return true;
  const title = (j.title || '').toLowerCase();
  return (
    cat.includes('DOCUMENT') ||
    cat.includes('CERTIFICATE') ||
    title.includes('document') ||
    title.includes('certificate') ||
    title.includes('verification')
  );
};

export const isImportant = (j) => {
  if (!j) return false;
  const cat = (j.category || '').toUpperCase();
  if (cat === 'IMPORTANT') return true;
  const title = (j.title || '').toLowerCase();
  return cat.includes('IMPORTANT') || title.includes('important') || title.includes('scheme') || title.includes('yojna');
};

export const getJobsForCategory = (allJobs = [], categoryKey = '') => {
  const key = (categoryKey || '').toUpperCase().trim();
  if (key === 'RESULT') return allJobs.filter(isResult);
  if (key === 'ANSWER KEY' || key === 'ANSKEY') return allJobs.filter(isAnswerKey);
  if (key === 'ADMIT CARD' || key === 'ADMIT') return allJobs.filter(isAdmitCard);
  if (key === 'LATEST JOB' || key === 'JOB' || key === 'LATEST JOBS') return allJobs.filter(isLatestJob);
  if (key === 'ADMISSION') return allJobs.filter(isAdmission);
  if (key === 'SYLLABUS') return allJobs.filter(isSyllabus);
  if (key === 'DOCUMENTS' || key === 'DOCUMENT' || key === 'CERTIFICATE VERIFICATION') return allJobs.filter(isDocument);
  if (key === 'IMPORTANT') return allJobs.filter(isImportant);
  return allJobs.filter((j) => (j.category || '').toUpperCase().includes(key));
};

export const ALL_COLUMNS = [
  { key: 'RESULT', title: 'Result', slug: '/results', colorClass: 'col-darkred', singleTitle: 'Results 2026' },
  { key: 'ADMIT CARD', title: 'Admit Card', slug: '/admit-card', colorClass: 'col-darkred', singleTitle: 'Admit Cards & Hall Tickets 2026' },
  { key: 'LATEST JOB', title: 'Latest Job', slug: '/latest-jobs', colorClass: 'col-darkred', singleTitle: 'Latest Govt Jobs Notifications 2026' },
  { key: 'ANSWER KEY', title: 'Answer Key', slug: '/answer-key', colorClass: 'col-darkred', singleTitle: 'Answer Keys & Solutions 2026' },
  { key: 'SYLLABUS', title: 'Syllabus', slug: '/syllabus', colorClass: 'col-darkred', singleTitle: 'Exam Pattern & Syllabus 2026' },
  { key: 'ADMISSION', title: 'Admission', slug: '/admission', colorClass: 'col-darkred', singleTitle: 'Admission Notifications 2026' },
];

