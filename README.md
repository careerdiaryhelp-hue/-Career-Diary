# Career Diary - React + Vite Govt Job Portal

Career Diary (careerdiary.in) is a modern, responsive React + Vite Indian Government Job Recruitment Portal & Exam Updates Website.

## 🌟 Key Features

- **Built with React 18 + Vite**: Lightning-fast performance and clean modular architecture.
- **Top Announcement Ticker**: Real-time breaking news marquee ticker for major updates.
- **Top Highlights Grid**: Colorful visual banner cards matching the exact layout of Career Diary / Sarkari Result portals (RPSC 71st CCE, SSC CGL, RRB NTPC, Bihar Police Constable, etc.).
- **4 Main Color-Coded Column Sections**:
  - 💼 **LATEST JOB** (Pink theme)
  - 📜 **SYLLABUS** (Green theme)
  - 🪪 **ADMIT CARD** (Blue theme)
  - 📊 **ANSWER KEY / RESULT** (Purple theme)
- **State & Category Filtering**: Instant filter pills for All India, Bihar, SSC, Railway, and Banking.
- **Live Search**: Instant keyword search with highlighting across all posts.
- **Interactive Job Detail Modal**: Detailed breakdown of Important Dates, Application Fees, Age Limit, Vacancy Tables, Eligibility, and Direct Links.
- **Post Job Update Modal**: Interactive admin panel to publish custom recruitment posts with LocalStorage persistence.
- **Govt Job Age Calculator**: Tool to calculate exact age in years, months, and days against recruitment cut-off dates.
- **Dark / Light Theme Toggle**: Seamless dark mode support for night viewing.

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Repository Structure

```
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── TopTicker.jsx
│   │   ├── Header.jsx
│   │   ├── Navbar.jsx
│   │   ├── HighlightsGrid.jsx
│   │   ├── JobColumnsGrid.jsx
│   │   ├── JobDetailModal.jsx
│   │   ├── PostJobModal.jsx
│   │   ├── AgeCalcModal.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   └── initialJobs.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## 📜 License

MIT License. Created for Career Diary Help.
