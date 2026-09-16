import React from 'react';
import { ArrowLeft, Building2, Tag, CalendarCheck, Award, UserCheck, Info, Link, FileDown, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import AdSenseBanner, { DisplayAd, InPostAd, MultiplexAd } from '../components/AdSenseBanner';
import AutoFAQSection from '../components/AutoFAQSection';
import SEOHead from '../components/SEOHead';

export default function ResultDetailPage({ job, onBack }) {
  if (!job) return null;

  const getLinkUrl = (...keys) => {
    if (job.importantLinks && typeof job.importantLinks === 'object') {
      for (const key of keys) {
        const foundKey = Object.keys(job.importantLinks).find(k => k.toLowerCase().includes(key.toLowerCase()));
        if (foundKey && job.importantLinks[foundKey] && typeof job.importantLinks[foundKey] === 'string' && job.importantLinks[foundKey].startsWith('http')) {
          return job.importantLinks[foundKey];
        }
      }
      const firstVal = Object.values(job.importantLinks).find(v => typeof v === 'string' && v.startsWith('http'));
      if (firstVal) return firstVal;
    }
    if (job.applyUrl && typeof job.applyUrl === 'string' && job.applyUrl.startsWith('http')) return job.applyUrl;
    if (job.officialUrl && typeof job.officialUrl === 'string' && job.officialUrl.startsWith('http')) return job.officialUrl;
    return null;
  };

  const officialWebUrl = getLinkUrl('official website', 'website', 'portal', 'home') || 'https://www.careerdiary.in';
  const resultUrl = getLinkUrl('result', 'scorecard', 'key', 'answer', 'marks', 'merit') || officialWebUrl;
  const notificationUrl = getLinkUrl('notification', 'notice', 'pdf', 'cutoff') || officialWebUrl;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Dynamic SEO Meta, Titles & Schema */}
      <SEOHead
        title={`${job.title} – Result Out, Merit List PDF & Cut Off Marks | Career Diary`}
        description={`Check ${job.title} Result 2026 online. Download qualifying merit list PDF, subject-wise score card, category cut off marks and direct link on Career Diary.`}
        canonicalUrl={`https://careerdiary.in/${job.id}`}
        job={job}
        category="Result"
      />
      {/* Back Button & Breadcrumb */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to All Posts
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Home &gt; Result / Answer Key &gt; <strong>{job.title.substring(0, 30)}...</strong>
        </span>
      </div>

      {/* Main Container Card */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
        
        {/* Banner Header */}
        <div style={{ borderBottom: '2px solid #8e44ad', paddingBottom: '16px', marginBottom: '20px' }}>
          <span className="badge badge-purple" style={{ marginBottom: '8px', display: 'inline-block' }}>RESULT / ANSWER KEY OUT</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-heading)', lineHeight: '1.4', marginBottom: '12px' }}>
            {job.title}
          </h1>
          <div className="job-detail-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <span><Building2 className="w-4 h-4 inline mr-1" style={{ color: '#8e44ad' }} /> <strong>Board:</strong> {job.organization || 'Exam Board'}</span>
            <span><Tag className="w-4 h-4 inline mr-1" style={{ color: '#8e44ad' }} /> <strong>Post / Exam:</strong> {job.postName || job.title}</span>
            <span><UserCheck className="w-4 h-4 inline mr-1" style={{ color: '#8e44ad' }} /> <strong>Status:</strong> Declared / Official Link Active</span>
          </div>
        </div>

        {/* Quick Top CTA Box */}
        <div style={{ backgroundColor: 'rgba(142, 68, 173, 0.08)', border: '1px solid rgba(142, 68, 173, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#8e44ad' }}>Check Official Result / Cut Off / Score Card</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>View roll number merit list PDF and subject-wise score sheet</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#8e44ad', color: '#fff' }}>
              <Award className="w-4 h-4 inline mr-1" /> Check Result / Score Card
            </a>
            <a href={notificationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <FileDown className="w-4 h-4 inline mr-1" /> Download Cutoff PDF
            </a>
          </div>
        </div>

        {/* AdSense Block Ad #1: Display Ad */}
        <DisplayAd label="ADVERTISEMENT" style={{ margin: '16px 0' }} />

        {/* Dates Box */}
        <div className="detail-boxes-grid" style={{ marginBottom: '24px' }}>
          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: '#8e44ad', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarCheck className="w-5 h-5" /> Declaration Timeline
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Result Declaration Date:</span> <strong style={{ color: '#8e44ad' }}>{job.lastDate || 'Declared Today'}</strong>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Answer Key / Response Sheet:</span> <strong>Live Available</strong>
              </li>
              <li style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Scorecard Download:</span> <strong>Active Online</strong>
              </li>
            </ul>
          </div>

          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: '#8e44ad', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 className="w-5 h-5" /> Next Steps After Result
            </h3>
            <ul style={{ paddingLeft: '18px', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-main)', margin: 0 }}>
              <li>Download and print your official Score Card for counseling/DV.</li>
              <li>Check Category-wise Cut off marks list for qualification status.</li>
              <li>Keep original marksheets & certificates ready for Document Verification.</li>
            </ul>
          </div>
        </div>

        {/* Overview */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info className="w-5 h-5" style={{ color: '#8e44ad' }} /> Result &amp; Answer Key Details
          </h3>
          <p style={{ fontSize: '0.96rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
            {job.description || `The official examination result, score card, and tentative answer key for ${job.title} has been declared. Candidates can check their roll number in the merit selection list PDF or view subject-wise marks by logging into the official portal.`}
          </p>
        </div>

        {/* How To Check & Download Result */}
        <table className="sr-table" style={{ marginBottom: '24px' }}>
          <tbody>
            <tr>
              <td className="sr-table-subheading">How To Check &amp; Download {job.title} Result 2026</td>
            </tr>
            <tr>
              <td>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', margin: 0 }}>
                  <li>Visit the official website of {job.organization || 'the exam board'}.</li>
                  <li>Go to the Results / Latest Notices tab on the home page.</li>
                  <li>Click on the link titled &quot;Check Result / Merit List PDF for {job.title}&quot;.</li>
                  <li>Alternatively, click on the direct link provided in the Important Links table on Career Diary.</li>
                  <li>If prompted, enter your Roll Number, Registration ID, and Date of Birth (DOB).</li>
                  <li>The result / scorecard / qualifying merit list PDF will appear on screen.</li>
                  <li>Use Ctrl+F to search your Roll Number or Name in the merit list PDF.</li>
                  <li>Download and save your official scorecard PDF for document verification (DV).</li>
                </ol>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Mode Of Selection */}
        <table className="sr-table" style={{ marginBottom: '24px' }}>
          <tbody>
            <tr>
              <td className="sr-table-subheading">Mode Of Selection &amp; Next Stage</td>
            </tr>
            <tr>
              <td>
                <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Written Examination / CBT Result Declaration</li>
                  <li>Category-wise Cut Off Marks Verification</li>
                  <li>Document Verification (DV) &amp; Original Certificate Check</li>
                  <li>Final Selection List Publication</li>
                </ol>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Social Channel Join Table (SarkariResult Style) */}
        <table className="sr-table" style={{ margin: '16px 0' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', color: '#0088cc', width: '60%', verticalAlign: 'middle' }}>
                Join Our Telegram Channel
              </td>
              <td style={{ textAlign: 'center' }}>
                <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#0088cc', color: '#fff', fontWeight: 'bold' }}>
                  Follow Now
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', color: '#25d366', verticalAlign: 'middle' }}>
                Join Our WhatsApp Channel
              </td>
              <td style={{ textAlign: 'center' }}>
                <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#25d366', color: '#fff', fontWeight: 'bold' }}>
                  Follow Now
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        {/* AdSense Block Ad #2: InPost Ad */}
        <InPostAd label="ADVERTISEMENT" style={{ margin: '20px 0' }} />

        {/* Direct Links Table */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8e44ad', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link className="w-5 h-5" /> Official Result & Answer Key Links
          </h3>
          <table className="table-styled">
            <tbody>
              {job.importantLinks && typeof job.importantLinks === 'object' && Object.keys(job.importantLinks).length > 0 ? (
                Object.entries(job.importantLinks).map(([label, url], idx) => {
                  const isValid = typeof url === 'string' && url.startsWith('http');
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: '700', width: '55%' }}>{label}</td>
                      <td>
                        {isValid ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#8e44ad', color: '#fff' }}>
                            Click Here
                          </a>
                        ) : (
                          <span style={{ color: '#8e44ad', fontWeight: 'bold' }}>Link Active Soon</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <>
                  <tr>
                    <td style={{ fontWeight: '700', width: '55%' }}>Check Result / Download Score Card</td>
                    <td>
                      <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#8e44ad', color: '#fff' }}>
                        Click Here to Check Result
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '700' }}>Download Tentative Answer Key / Objection Link</td>
                    <td>
                      <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                        View Answer Key
                      </a>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic FAQ Section with Google Rich Snippets */}
        <AutoFAQSection job={job} category="result" />

        {/* AdSense Block Ad #3: Multiplex Ad */}
        <MultiplexAd label="RECOMMENDED FOR YOU" style={{ margin: '20px 0' }} />

        {/* Community Social Join */}
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-heading)' }}>
            Get Instant Result & Answer Key Alerts on Telegram & WhatsApp
          </h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
            <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#0088cc', color: '#fff' }}>
              <Send className="w-4 h-4 inline mr-1" /> Join Telegram Channel
            </a>
            <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#25D366', color: '#fff' }}>
              <MessageCircle className="w-4 h-4 inline mr-1" /> Join WhatsApp Channel
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
