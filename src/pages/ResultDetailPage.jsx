import React from 'react';
import { ArrowLeft, Building2, Tag, CalendarCheck, Award, UserCheck, Info, Link, FileDown, Send, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function ResultDetailPage({ job, onBack }) {
  if (!job) return null;

  const getLinkUrl = (key) => {
    if (job.importantLinks && typeof job.importantLinks === 'object') {
      const foundKey = Object.keys(job.importantLinks).find(k => k.toLowerCase().includes(key));
      if (foundKey) return job.importantLinks[foundKey];
    }
    return null;
  };

  const resultUrl = getLinkUrl('result') || getLinkUrl('scorecard') || getLinkUrl('key') || getLinkUrl('answer') || "https://careerdiary.in";
  const notificationUrl = getLinkUrl('notification') || getLinkUrl('official') || "https://careerdiary.in";
  const officialWebUrl = getLinkUrl('official website') || getLinkUrl('website') || "https://careerdiary.in";

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
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

        {/* Quick Top CTA Box for Result Download */}
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
            <Info className="w-5 h-5" style={{ color: '#8e44ad' }} /> Result & Answer Key Details
          </h3>
          <p style={{ fontSize: '0.96rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
            {job.description || 'Check your examination result, roll number selection list PDF, cut off marks breakdown, and tentative answer key objection portal.'}
          </p>
        </div>

        {/* Direct Links Table */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8e44ad', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link className="w-5 h-5" /> Official Result & Answer Key Links
          </h3>
          <table className="table-styled">
            <tbody>
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
              <tr>
                <td style={{ fontWeight: '700' }}>Official Portal Website</td>
                <td>
                  <a href={officialWebUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                    Visit Official Site
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
