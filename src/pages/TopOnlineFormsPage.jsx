import React, { useMemo } from 'react';

export default function TopOnlineFormsPage({ jobs = [] }) {
  // Filter only jobs that are marked as isTopForm
  const topForms = useMemo(() => {
    return jobs.filter(j => Boolean(j.isTopForm) && !j.title?.toLowerCase().includes('top online form'));
  }, [jobs]);

  const boxColors = [
    'bg-box-redorange',   // #ff3300
    'bg-box-forestgreen', // #006b00
    'bg-box-magentapink', // #ef35bf
    'bg-box-vividblue',   // #1e7fe8
    'bg-box-olive',       // #8d9200
    'bg-box-deepblue',    // #1a2fc8
    'bg-box-orange',      // #ff6a00
    'bg-box-maroon',      // #a80000
    'bg-box-purple'       // #b900ff
  ];

  return (
    <div className="page-container" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '20px 8px' }}>
        {/* Info Header */}
        <div style={{ borderBottom: '2px solid #a80000', paddingBottom: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <strong style={{ color: '#a80000', width: '150px', flexShrink: 0 }}>Name of Post:</strong>
            <h1 style={{ color: '#a80000', fontSize: '24px', margin: 0, fontWeight: 'bold' }}>
              Top Online Form : Current Jobs/ Vacancy: 2026
            </h1>
          </div>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <strong style={{ color: '#a80000', width: '150px', flexShrink: 0 }}>Post Update Date:</strong>
            <strong style={{ color: '#000' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
          <div style={{ display: 'flex' }}>
            <strong style={{ color: '#a80000', width: '150px', flexShrink: 0 }}>Short Information:</strong>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>
              <strong>CareerDiary:</strong> CareerDiary Are Recently Uploaded Top Category of Online Form, Current Vacancy/ Jobs in Various Sector Like SSC, Banking, UPSC, Railway, Army, Navy, Airforce, Police, BPSC, All PCS, TET Vacancy and More Only at Single Page. All Interested Candidates Visit this Page and Easily Gather Full Information of Jobs then Apply Online Now with Fastest Network.
            </div>
          </div>
        </div>

        {/* Ad Space Top (Optional) */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="ad-placeholder" style={{ border: '1px dashed #ccc', padding: '10px', color: '#999' }}>
            [AdSense Slot - Top]
          </div>
        </div>

        {/* Grid of Forms */}
        <div className="top-banners-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '30px' }}>
          {topForms.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: 'span 4' }}>No top online forms available at the moment.</div>
          ) : (
            topForms.map((job, index) => (
              <a
                key={job.id}
                href={`/${job.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`banner-card ${boxColors[index % boxColors.length]}`}
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                <div className="banner-title">{job.title}</div>
              </a>
            ))
          )}
        </div>

        {/* SEO Content Section */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', lineHeight: '1.7', fontSize: '14px', color: '#333' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>About Top Online Form 2026-27</h2>
          <p style={{ marginBottom: '10px' }}>
            Career Diary (CareerDiary.in) is one of the most trusted platforms for latest government job notifications, online form submissions, and recruitment updates across India. On this page, you'll find the most popular and trending online forms that are currently active.
          </p>
          <p style={{ marginBottom: '10px' }}>
            Platforms like Career Diary provide a centralized hub for all government job-related information, including:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '4px' }}><strong>Form Submission:</strong> Apply online for various government jobs across SSC, Banking, UPSC, Railway, Defence, Police, State PSC, and more.</li>
            <li style={{ marginBottom: '4px' }}><strong>Updates and Notifications:</strong> Get real-time updates on application deadlines, exam dates, admit cards, and important notices.</li>
            <li style={{ marginBottom: '4px' }}><strong>Guidance and Help:</strong> Step-by-step instructions on how to fill out application forms correctly.</li>
            <li style={{ marginBottom: '4px' }}><strong>Results and Information:</strong> View outcomes, cut-off marks, and merit lists for various examinations.</li>
          </ul>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '18px', marginBottom: '8px' }}>General Keywords</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Top Online Forms 2026</li>
            <li>Online Form Submission 2026-27</li>
            <li>Important Online Forms 2026</li>
            <li>Best Online Forms 2026-27</li>
            <li>Online Application Forms 2026</li>
          </ol>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '14px', marginBottom: '8px' }}>Educational Forms</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Admission Forms 2026</li>
            <li>Scholarship Application 2026-27</li>
            <li>Entrance Exam Forms 2026</li>
            <li>University Application Forms 2026</li>
            <li>College Admission Forms 2026</li>
          </ol>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '14px', marginBottom: '8px' }}>Government Forms</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Government Online Forms 2026-27</li>
            <li>SSC Online Application Forms 2026</li>
            <li>Railway Recruitment Forms 2026</li>
            <li>UPSC Application Forms 2026</li>
            <li>State PSC Forms 2026</li>
          </ol>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '14px', marginBottom: '8px' }}>Employment Forms</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Job Application Forms 2026-27</li>
            <li>Defence Recruitment Forms 2026</li>
            <li>Police Recruitment Forms 2026</li>
            <li>Banking Job Forms 2026</li>
            <li>Teaching Recruitment Forms 2026</li>
          </ol>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '14px', marginBottom: '8px' }}>Health and Insurance Forms</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Health Insurance Forms 2026-27</li>
            <li>Medical Recruitment Forms 2026</li>
            <li>AIIMS Application Forms 2026</li>
            <li>Nursing Recruitment Forms 2026</li>
            <li>Paramedical Forms 2026</li>
          </ol>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '14px', marginBottom: '8px' }}>Specific to CareerDiary.in</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>CareerDiary Online Forms 2026</li>
            <li>CareerDiary Form Submissions 2026-27</li>
            <li>CareerDiary Application Guide 2026</li>
            <li>CareerDiary Form Status 2026</li>
            <li>CareerDiary Application Updates 2026</li>
          </ol>

          <p style={{ marginBottom: '15px', fontSize: '13px', color: '#555' }}>
            Using these keywords effectively in your content, meta descriptions, headings, and tags can help improve visibility and attract the right audience.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '18px', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>How to Use Top Online Form 2026-27</h2>
          <p style={{ marginBottom: '10px' }}>
            To effectively use "Top Online Form 2026-27" on CareerDiary.in, follow these steps to navigate the site and make the most of its resources:
          </p>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>1. Explore the Website</h3>
          <p style={{ marginBottom: '10px' }}>
            Visit <a href="https://careerdiary.in" style={{ color: '#1e7fe8' }}>CareerDiary.in</a> and browse through the available online forms. Use the navigation menu to explore categories like Latest Jobs, Admit Cards, Results, and Top Online Forms.
          </p>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>2. Select Your Desired Form</h3>
          <p style={{ marginBottom: '10px' }}>
            Click on any job card to view the detailed information including eligibility criteria, important dates, application fees, and direct apply links.
          </p>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>3. Apply Online</h3>
          <p style={{ marginBottom: '10px' }}>
            Use the "Apply Online" link provided on each job detail page to navigate directly to the official application portal. Make sure to apply before the last date mentioned.
          </p>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>4. Stay Updated</h3>
          <p style={{ marginBottom: '0' }}>
            Join our <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" style={{ color: '#25D366' }}>WhatsApp Channel</a> and <a href="https://t.me/careerdiary" style={{ color: '#0088cc' }}>Telegram Channel</a> to receive instant notifications about new job openings, admit cards, and results.
          </p>
        </div>

        {/* Ad Space Bottom (Optional) */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <div className="ad-placeholder" style={{ border: '1px dashed #ccc', padding: '10px', color: '#999' }}>
            [AdSense Slot - Bottom]
          </div>
        </div>

      </div>
    </div>
  );
}
