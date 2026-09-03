// Initial Seed Dataset matching the screenshot & Career Diary portal entries
const INITIAL_JOBS = [
  // LATEST JOBS
  {
    id: 1,
    title: "SSC CGL RECRUITMENT 2025 ONLINE FORM APPLY",
    category: "LATEST JOB",
    state: "SSC",
    badge: "New!",
    lastDate: "04-07-2025",
    vacancies: "17,727 Posts",
    bannerColor: "pink",
    organization: "Staff Selection Commission (SSC)",
    postName: "Combined Graduate Level (CGL) 2025 Group B & C",
    appStart: "24/06/2025",
    appLast: "04/07/2025",
    feeGen: "₹100",
    feeSc: "₹0 (Exempted)",
    minAge: "18 Years",
    maxAge: "27-32 Years (Post Wise)",
    qualification: "Bachelor Degree in any discipline from a recognized University.",
    description: "Staff Selection Commission (SSC) has invited online applications for Combined Graduate Level Examination CGL 2025 for recruitment of 17,727 vacancies across various Ministries & Departments."
  },
  {
    id: 2,
    title: "RRB TECHNICIAN GRADE 1 & 3 RECRUITMENT 2025",
    category: "LATEST JOB",
    state: "Railway",
    badge: "Link Active",
    lastDate: "15-08-2025",
    vacancies: "14,298 Posts",
    bannerColor: "orange",
    organization: "Railway Recruitment Board (RRB)",
    postName: "Technician Grade I Signal & Technician Grade III",
    appStart: "09/03/2025",
    appLast: "15/08/2025",
    feeGen: "₹500 (₹400 Refundable)",
    feeSc: "₹250 (Full Refundable)",
    minAge: "18 Years",
    maxAge: "33-36 Years",
    qualification: "B.Sc / Diploma / Engineering Degree or ITI Certificate in relevant trade.",
    description: "Indian Railways RRB invites online applications for 14,298 Technician Grade 1 Signal and Grade 3 posts under CEN 02/2024."
  },
  {
    id: 3,
    title: "BIHAR B.ED COUNSELLING 2025",
    category: "LATEST JOB",
    state: "Bihar",
    badge: "START",
    lastDate: "29-06-2025",
    vacancies: "37,000+ Seats",
    bannerColor: "green",
    organization: "Lalit Narayan Mithila University (LNMU), Darbhanga",
    postName: "Bihar 2-Year B.Ed Combined Entrance Test (CET-BED) Counselling 2025",
    appStart: "20/06/2025",
    appLast: "29/06/2025",
    feeGen: "₹1,000",
    feeSc: "₹500",
    minAge: "No Age Limit",
    maxAge: "N/A",
    qualification: "Passed Bihar B.Ed CET 2025 Entrance Exam with minimum qualifying marks.",
    description: "LNMU Darbhanga has opened the online college preference choice filling and counselling registration portal for Bihar B.Ed Admissions 2025."
  },
  {
    id: 4,
    title: "BIHAR BPSC MOTOR VEHICLE INSPECTORS RECRUITMENT 2025",
    category: "LATEST JOB",
    state: "Bihar",
    badge: "Last Date Soon",
    lastDate: "03-07-2025",
    vacancies: "28 Posts",
    bannerColor: "purple",
    organization: "Bihar Public Service Commission (BPSC)",
    postName: "Motor Vehicle Inspector (MVI) Advt No. 28/2025",
    appStart: "10/06/2025",
    appLast: "03/07/2025",
    feeGen: "₹750",
    feeSc: "₹200",
    minAge: "18 Years",
    maxAge: "37 Years (Male), 40 Years (Female)",
    qualification: "Diploma in Automobile Engineering or Mechanical Engineering with valid Driving License.",
    description: "BPSC invites online applications for Motor Vehicle Inspector (MVI) in Transport Dept Govt of Bihar."
  },
  {
    id: 5,
    title: "BIHAR PRD TECHNICAL ASSISTANT ONLINE FORM",
    category: "LATEST JOB",
    state: "Bihar",
    badge: "New!",
    lastDate: "25-06-2025",
    vacancies: "1,560 Posts",
    bannerColor: "pink",
    organization: "Panchayati Raj Dept, Bihar (PRD)",
    postName: "Technical Assistant & Accountant cum IT Assistant",
    appStart: "01/06/2025",
    appLast: "25/06/2025",
    feeGen: "₹0",
    feeSc: "₹0",
    minAge: "21 Years",
    maxAge: "37 Years",
    qualification: "Diploma in Civil Engineering or B.Com / M.Com degree.",
    description: "Bihar PRD invites applications for Technical Assistant posts in Gram Panchayats."
  },
  {
    id: 6,
    title: "OFSS BIHAR 11TH 1ST MERIT LIST 2025 OUT NOW",
    category: "LATEST JOB",
    state: "Bihar",
    badge: "Out",
    lastDate: "30-06-2025",
    vacancies: "5,00,000+ Seats",
    bannerColor: "teal",
    organization: "Bihar School Examination Board (BSEB)",
    postName: "OFSS Bihar Class 11th Intermediate Admission 1st Cut Off & Allotment",
    appStart: "15/06/2025",
    appLast: "30/06/2025",
    feeGen: "₹350",
    feeSc: "₹350",
    minAge: "Passed 10th",
    maxAge: "N/A",
    qualification: "Class 10th (Matriculation) Passed from BSEB or CBSE/ICSE board.",
    description: "BSEB has released the 1st Merit List and Intimation Letter for OFSS Bihar Intermediate (11th) Admission 2025."
  },

  // ADMIT CARDS
  {
    id: 7,
    title: "BIHAR BSSC FIELD ASSISTANT ADMIT CARD",
    category: "ADMIT CARD",
    state: "Bihar",
    badge: "Out",
    lastDate: "Exam: July 2025",
    vacancies: "450 Posts",
    bannerColor: "blue",
    organization: "Bihar Staff Selection Commission (BSSC)",
    postName: "Field Assistant (Kshetra Sahayak) Advt 01/2024",
    appStart: "Downloaded Live",
    appLast: "Exam Date: 12/07/2025",
    feeGen: "N/A",
    feeSc: "N/A",
    minAge: "18 Years",
    maxAge: "37 Years",
    qualification: "10+2 Intermediate Passed.",
    description: "Download BSSC Field Assistant written examination call letter and roll number status."
  },
  {
    id: 8,
    title: "BIHAR POLICE CONSTABLE 19838 POST ADMIT CARD OUT",
    category: "ADMIT CARD",
    state: "Bihar",
    badge: "Out",
    lastDate: "Exam: 07-28 Aug 2025",
    vacancies: "19,838 Posts",
    bannerColor: "orange",
    organization: "Central Selection Board of Constable (CSBC) Bihar",
    postName: "Bihar Police Constable Recruitment 2024-2025",
    appStart: "Admit Card Out: 05/08/2025",
    appLast: "Exam Dates: Aug 2025",
    feeGen: "N/A",
    feeSc: "N/A",
    minAge: "18 Years",
    maxAge: "25 Years",
    qualification: "10+2 Intermediate Exam Passed from any recognized Board.",
    description: "CSBC Bihar Police Constable Admit Card and Exam City Intimation status published for 19,838 posts."
  },
  {
    id: 9,
    title: "RRB NTPC UNDER GRADUATE LEVEL APPLICATION STATUS OUT",
    category: "ADMIT CARD",
    state: "Railway",
    badge: "New!",
    lastDate: "Check Status Now",
    vacancies: "3,445 Posts",
    bannerColor: "blue",
    organization: "Railway Recruitment Control Board",
    postName: "RRB NTPC Under Graduate (UG) 06/2024 Posts",
    appStart: "Status Live",
    appLast: "Exam City: Active",
    feeGen: "N/A",
    feeSc: "N/A",
    minAge: "18 Years",
    maxAge: "30 Years",
    qualification: "12th Pass with minimum 50% Marks.",
    description: "Check your RRB NTPC UG Level application acceptance / rejection status and exam city center slip."
  },
  {
    id: 10,
    title: "RPF SI CEN 01/2024 PET/PMT/DV ADMIT CARD",
    category: "ADMIT CARD",
    state: "Railway",
    badge: "New!",
    lastDate: "Download Active",
    vacancies: "452 Posts",
    bannerColor: "purple",
    organization: "Railway Protection Force (RPF / RPF)",
    postName: "Sub Inspector (SI) Male & Female Physical Call Letter",
    appStart: "Active",
    appLast: "N/A",
    feeGen: "N/A",
    feeSc: "N/A",
    minAge: "20 Years",
    maxAge: "28 Years",
    qualification: "Bachelor Degree in any stream.",
    description: "Download RPF SI Physical Efficiency Test (PET) and Document Verification Admit Card."
  },

  // SYLLABUS
  {
    id: 11,
    title: "SSC CGL SYLLABUS & EXAM PATTERN 2025 PDF",
    category: "SYLLABUS",
    state: "SSC",
    badge: "Active",
    lastDate: "Updated 2025",
    vacancies: "N/A",
    bannerColor: "green",
    organization: "Staff Selection Commission (SSC)",
    postName: "SSC CGL Tier 1 & Tier 2 Detailed Subject Wise Syllabus",
    appStart: "2025 Pattern",
    appLast: "N/A",
    feeGen: "Free PDF",
    feeSc: "Free PDF",
    minAge: "N/A",
    maxAge: "N/A",
    qualification: "Graduate Level Examination Syllabus",
    description: "Complete chapter-wise syllabus for Reasoning, Quantitative Aptitude, English Comprehension, and General Awareness."
  },
  {
    id: 12,
    title: "BIHAR BPSC 71ST CCE PRE 2025 SYLLABUS",
    category: "SYLLABUS",
    state: "Bihar",
    badge: "Active",
    lastDate: "Revised",
    vacancies: "1,929 Posts",
    bannerColor: "green",
    organization: "Bihar Public Service Commission",
    postName: "BPSC 71st Combined Competitive Prelims Exam Pattern",
    appStart: "Active",
    appLast: "N/A",
    feeGen: "Free PDF",
    feeSc: "Free PDF",
    minAge: "N/A",
    maxAge: "N/A",
    qualification: "Graduation Degree",
    description: "General Studies 150 Marks 2 hours negative marking pattern details & topic breakdown."
  },

  // RESULT & ANSWER KEY
  {
    id: 13,
    title: "SSC GD CONSTABLE 2025 ANS KEY / RESULT / SCORECARD",
    category: "RESULT / ANSWER KEY",
    state: "SSC",
    badge: "Out",
    lastDate: "Scorecard Out",
    vacancies: "26,146 Posts",
    bannerColor: "purple",
    organization: "Staff Selection Commission (SSC)",
    postName: "Constable GD in CAPFs, SSF and Rifleman (GD) in Assam Rifles",
    appStart: "05/08/2025",
    appLast: "N/A",
    feeGen: "N/A",
    feeSc: "N/A",
    minAge: "18 Years",
    maxAge: "23 Years",
    qualification: "10th High School Exam Passed.",
    description: "Check SSC GD Constable Computer Based Examination Response Sheet, Tentative Answer Key, and Cut off marks."
  },
  {
    id: 14,
    title: "RRB JE CHEMICAL & METALLURGICAL EXAM ANSWER KEY OUT",
    category: "RESULT / ANSWER KEY",
    state: "Railway",
    badge: "Out",
    lastDate: "Objection Link Live",
    vacancies: "7,951 Posts",
    bannerColor: "purple",
    organization: "Railway Recruitment Board (RRB)",
    postName: "Junior Engineer (JE) CEN 03/2024 CBT 1 Key",
    appStart: "Live",
    appLast: "N/A",
    feeGen: "N/A",
    feeSc: "N/A",
    minAge: "18 Years",
    maxAge: "36 Years",
    qualification: "Diploma / B.Tech Degree in Engineering.",
    description: "View CBT-1 official question paper, candidate response keys and submit objections online."
  },
  {
    id: 15,
    title: "BIHAR BOARD COMPARTMENT EXAM RESULT 2025",
    category: "RESULT / ANSWER KEY",
    state: "Bihar",
    badge: "Out",
    lastDate: "Declared",
    vacancies: "N/A",
    bannerColor: "purple",
    organization: "Bihar School Examination Board (BSEB)",
    postName: "Class 10th & 12th Special / Compartmental Result 2025",
    appStart: "Declared",
    appLast: "N/A",
    feeGen: "N/A",
    feeSc: "N/A",
    minAge: "N/A",
    maxAge: "N/A",
    qualification: "Matric / Inter Student",
    description: "Check BSEB Bihar Board 10th & 12th Compartmental cumulative marksheet and division."
  }
];

// App State Management
let jobListings = [];
let currentCategory = 'all';
let currentStateFilter = 'all';
let currentSearchQuery = '';

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadJobListings();
  setupEventListeners();
  renderApp();
});

// Load jobs from LocalStorage or seed data
function loadJobListings() {
  const savedData = localStorage.getItem('career_diary_jobs');
  if (savedData) {
    try {
      jobListings = JSON.parse(savedData);
    } catch (e) {
      jobListings = [...INITIAL_JOBS];
    }
  } else {
    jobListings = [...INITIAL_JOBS];
    saveJobListings();
  }
}

function saveJobListings() {
  localStorage.setItem('career_diary_jobs', JSON.stringify(jobListings));
}

// Setup DOM Event Listeners
function setupEventListeners() {
  // Theme Toggle
  const themeBtn = document.getElementById('themeToggleBtn');
  themeBtn.addEventListener('click', toggleTheme);

  // Search Input Live Filter
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    clearBtn.style.display = currentSearchQuery.length > 0 ? 'block' : 'none';
    renderApp();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    clearBtn.style.display = 'none';
    renderApp();
  });

  // Nav Category Filter
  const navItems = document.querySelectorAll('#navCategoryFilter li');
  navItems.forEach(li => {
    li.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      currentCategory = li.getAttribute('data-cat');
      renderApp();
    });
  });

  // State Filter Pills
  const stateBtns = document.querySelectorAll('#stateFilters .pill-btn');
  stateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStateFilter = btn.getAttribute('data-state');
      renderApp();
    });
  });

  // Admin Form Submit
  const adminForm = document.getElementById('adminPostForm');
  if (adminForm) {
    adminForm.addEventListener('submit', handleAdminPostSubmit);
  }
}

// Theme Switcher
function toggleTheme() {
  const body = document.body;
  const icon = document.querySelector('#themeToggleBtn i');
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    icon.className = 'fa-solid fa-moon';
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    icon.className = 'fa-solid fa-sun';
  }
}

// Filtered Jobs Resolver
function getFilteredJobs() {
  return jobListings.filter(job => {
    // Category match
    const matchCategory = (currentCategory === 'all') || (job.category === currentCategory);
    
    // State match
    const matchState = (currentStateFilter === 'all') || 
                       (job.state && job.state.toLowerCase() === currentStateFilter.toLowerCase());

    // Search query match
    let matchQuery = true;
    if (currentSearchQuery) {
      const titleMatch = job.title.toLowerCase().includes(currentSearchQuery);
      const descMatch = job.description ? job.description.toLowerCase().includes(currentSearchQuery) : false;
      const orgMatch = job.organization ? job.organization.toLowerCase().includes(currentSearchQuery) : false;
      matchQuery = titleMatch || descMatch || orgMatch;
    }

    return matchCategory && matchState && matchQuery;
  });
}

// Render Master UI
function renderApp() {
  const filteredJobs = getFilteredJobs();

  // Search Indicator
  const searchIndicator = document.getElementById('searchResultIndicator');
  if (currentSearchQuery || currentCategory !== 'all' || currentStateFilter !== 'all') {
    searchIndicator.style.display = 'flex';
    document.getElementById('searchQueryText').innerText = currentSearchQuery || `${currentCategory} (${currentStateFilter})`;
    document.getElementById('searchResultCount').innerText = filteredJobs.length;
  } else {
    searchIndicator.style.display = 'none';
  }

  // Render Top Banners Grid (Blogger Style colorful boxes)
  renderTopBanners(filteredJobs);

  // Render 4 Main Columns
  renderColumn('LATEST JOB', 'list-latest-job', 'count-latest-job', filteredJobs);
  renderColumn('SYLLABUS', 'list-syllabus', 'count-syllabus', filteredJobs);
  renderColumn('ADMIT CARD', 'list-admit-card', 'count-admit-card', filteredJobs);
  renderColumn('RESULT / ANSWER KEY', 'list-result', 'count-result', filteredJobs);

  // Render Secondary Links
  renderColumn('ADMISSION', 'list-admission', null, filteredJobs);
  renderColumn('IMPORTANT', 'list-important', null, filteredJobs);
}

// Render Top Highlight Banners (Colorful Grid matching Blogger screenshot)
function renderTopBanners(jobs) {
  const container = document.getElementById('topBannersGrid');
  if (!container) return;

  const topItems = jobs.slice(0, 8); // Top 8 featured items
  if (topItems.length === 0) {
    container.innerHTML = `<div class="empty-state">No featured notifications match your current filter.</div>`;
    return;
  }

  container.innerHTML = topItems.map(job => `
    <div class="banner-card bg-${job.bannerColor || 'pink'}" onclick="openJobDetail(${job.id})">
      <div class="banner-title">${job.title}</div>
      ${job.badge ? `<span class="banner-badge">${job.badge}</span>` : ''}
    </div>
  `).join('');
}

// Render Single Column Card List
function renderColumn(category, containerId, countId, jobs) {
  const container = document.getElementById(containerId);
  const countEl = countId ? document.getElementById(countId) : null;
  if (!container) return;

  const categoryJobs = jobs.filter(j => j.category === category);
  
  if (countEl) {
    countEl.innerText = categoryJobs.length;
  }

  if (categoryJobs.length === 0) {
    container.innerHTML = `<div class="empty-state">No active updates.</div>`;
    return;
  }

  container.innerHTML = categoryJobs.map(job => {
    let badgeHtml = '';
    if (job.badge === 'New!') badgeHtml = `<span class="badge-tag tag-new">New!</span>`;
    else if (job.badge === 'Out') badgeHtml = `<span class="badge-tag tag-out">Out</span>`;
    else if (job.badge === 'START') badgeHtml = `<span class="badge-tag tag-new">START</span>`;
    else if (job.badge === 'Link Active') badgeHtml = `<span class="badge-tag tag-active">Link Active</span>`;
    else if (job.badge) badgeHtml = `<span class="badge-tag tag-last">${job.badge}</span>`;

    let dateText = job.lastDate ? `<span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;"> (Last Date: ${job.lastDate})</span>` : '';

    return `
      <a href="#" class="job-item-link" onclick="openJobDetail(${job.id}); return false;">
        <i class="fa-solid fa-angle-right" style="font-size:0.75rem; opacity:0.6; margin-right:4px;"></i>
        ${job.title} ${badgeHtml} ${dateText}
      </a>
    `;
  }).join('');
}

// Open Job Detail Modal
function openJobDetail(jobId) {
  const job = jobListings.find(j => j.id === jobId);
  if (!job) return;

  const modal = document.getElementById('jobDetailModal');
  const content = document.getElementById('jobDetailContent');

  content.innerHTML = `
    <div class="job-detail-header">
      <div class="job-detail-title">${job.title}</div>
      <div class="job-detail-meta">
        <span><i class="fa-solid fa-building-columns"></i> ${job.organization || 'Government Recruitment Board'}</span>
        <span><i class="fa-solid fa-tag"></i> Category: ${job.category}</span>
        <span><i class="fa-solid fa-briefcase"></i> Vacancies: ${job.vacancies || 'N/A'}</span>
      </div>
    </div>

    <div class="detail-boxes-grid">
      <div class="detail-info-box">
        <h4><i class="fa-regular fa-calendar-check"></i> Important Dates</h4>
        <ul>
          <li><span>Application Start:</span> <strong>${job.appStart || 'Declared'}</strong></li>
          <li><span>Last Date to Apply:</span> <strong style="color:var(--primary-color);">${job.appLast || job.lastDate || 'As per rules'}</strong></li>
          <li><span>Admit Card Date:</span> <strong>Notified Soon</strong></li>
          <li><span>Exam Date:</span> <strong>As per schedule</strong></li>
        </ul>
      </div>

      <div class="detail-info-box">
        <h4><i class="fa-solid fa-indian-rupee-sign"></i> Application Fee</h4>
        <ul>
          <li><span>General / OBC / EWS:</span> <strong>${job.feeGen || '₹0'}</strong></li>
          <li><span>SC / ST / PH:</span> <strong>${job.feeSc || '₹0'}</strong></li>
          <li><span>Payment Mode:</span> <strong>Online (Debit/Credit Card, Net Banking, UPI)</strong></li>
        </ul>
      </div>
    </div>

    <div class="detail-info-box" style="margin-bottom:20px;">
      <h4><i class="fa-solid fa-user-clock"></i> Age Limit & Eligibility Criteria</h4>
      <ul style="margin-bottom:12px;">
        <li><span>Minimum Age:</span> <strong>${job.minAge || '18 Years'}</strong></li>
        <li><span>Maximum Age:</span> <strong>${job.maxAge || '37 Years'}</strong></li>
        <li><span>Age Relaxation:</span> <strong>As per Govt Recruitment Rules</strong></li>
      </ul>
      <p style="font-size:0.9rem; margin-top:8px; padding-top:8px; border-top:1px dashed var(--border-color);">
        <strong>Educational Qualification:</strong> ${job.qualification || 'Passed 10th / 12th / Graduation degree from recognized institute/board.'}
      </p>
    </div>

    <div style="margin-bottom:20px;">
      <h4 style="font-family:'Outfit'; font-size:1.1rem; margin-bottom:8px;"><i class="fa-solid fa-circle-info"></i> Recruitment Overview</h4>
      <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">${job.description}</p>
    </div>

    <table class="table-styled">
      <thead>
        <tr>
          <th>Post Name</th>
          <th>Total Vacancies</th>
          <th>Eligibility</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${job.postName || job.title}</td>
          <td><strong>${job.vacancies || 'Various'}</strong></td>
          <td>${job.qualification || 'Specified above'}</td>
        </tr>
      </tbody>
    </table>

    <div class="action-links-grid">
      <a href="https://careerdiary1.blogspot.com/" target="_blank" class="btn btn-primary btn-block">
        <i class="fa-solid fa-link"></i> Apply Online / Official Portal
      </a>
      <a href="#" onclick="alert('Simulated Official Notification PDF Downloaded!'); return false;" class="btn btn-secondary btn-block">
        <i class="fa-solid fa-file-pdf"></i> Download Notification PDF
      </a>
      <a href="https://t.me/" target="_blank" class="btn btn-outline btn-block">
        <i class="fa-brands fa-telegram"></i> Join Telegram Alert
      </a>
    </div>
  `;

  modal.classList.add('open');
}

// Modal Closers
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}

// Admin Modal Handlers
function openAdminModal() {
  document.getElementById('adminModal').classList.add('open');
}

function handleAdminPostSubmit(e) {
  e.preventDefault();

  const newPost = {
    id: Date.now(),
    title: document.getElementById('postTitle').value.trim(),
    category: document.getElementById('postCategory').value,
    state: document.getElementById('postState').value.trim() || 'All India',
    badge: document.getElementById('postBadge').value,
    vacancies: document.getElementById('postVacancies').value.trim() || 'Various',
    lastDate: document.getElementById('postLastDate').value.trim() || 'Soon',
    bannerColor: document.getElementById('postBannerColor').value,
    description: document.getElementById('postDescription').value.trim(),
    organization: 'Career Diary Official Alert',
    postName: document.getElementById('postTitle').value.trim(),
    appStart: new Date().toLocaleDateString(),
    feeGen: '₹100',
    feeSc: '₹0',
    minAge: '18 Years',
    maxAge: '37 Years',
    qualification: 'As specified in post'
  };

  jobListings.unshift(newPost);
  saveJobListings();
  renderApp();
  closeModal('adminModal');
  e.target.reset();

  alert('Job update published successfully to Career Diary!');
}

// Age Calculator Modal Handlers
function openAgeCalcModal() {
  document.getElementById('ageCalcModal').classList.add('open');
  // Set default cutoff date to today
  document.getElementById('cutoffDateInput').valueAsDate = new Date();
}

function calculateAge() {
  const dobVal = document.getElementById('dobInput').value;
  const cutoffVal = document.getElementById('cutoffDateInput').value;

  if (!dobVal || !cutoffVal) {
    alert('Please select both Date of Birth and Cut-off date.');
    return;
  }

  const dob = new Date(dobVal);
  const cutoff = new Date(cutoffVal);

  if (dob > cutoff) {
    alert('Date of Birth cannot be after Cut-off date.');
    return;
  }

  let years = cutoff.getFullYear() - dob.getFullYear();
  let months = cutoff.getMonth() - dob.getMonth();
  let days = cutoff.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(cutoff.getFullYear(), cutoff.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const resultBox = document.getElementById('ageResultBox');
  const outputText = document.getElementById('ageOutputText');

  outputText.innerText = `${years} Years, ${months} Months, ${days} Days`;
  resultBox.style.display = 'block';
}

// Reset All Filters
function resetFilters() {
  currentCategory = 'all';
  currentStateFilter = 'all';
  currentSearchQuery = '';

  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearchBtn').style.display = 'none';

  const navItems = document.querySelectorAll('#navCategoryFilter li');
  navItems.forEach(item => item.classList.remove('active'));
  if (navItems[0]) navItems[0].classList.add('active');

  const stateBtns = document.querySelectorAll('#stateFilters .pill-btn');
  stateBtns.forEach(btn => btn.classList.remove('active'));
  if (stateBtns[0]) stateBtns[0].classList.add('active');

  renderApp();
}

function filterCategory(cat) {
  currentCategory = cat;
  renderApp();
}

function filterBySearch(query) {
  currentSearchQuery = query.toLowerCase();
  document.getElementById('searchInput').value = query;
  document.getElementById('clearSearchBtn').style.display = 'block';
  renderApp();
}
