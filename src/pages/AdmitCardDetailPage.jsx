import React from 'react';
import { ArrowLeft, Building2, Tag, CalendarCheck, FileText, UserCheck, Info, Link, FileDown, Send, MessageCircle, AlertCircle } from 'lucide-react';

export default function AdmitCardDetailPage({ job, onBack }) {
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
  const admitCardUrl = getLinkUrl('admit', 'status', 'city', 'download', 'hall', 'login') || officialWebUrl;
  const notificationUrl = getLinkUrl('notification', 'notice', 'pdf', 'brochure') || officialWebUrl;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Back Button & Breadcrumb */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to All Posts
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Home &gt; Admit Card &gt; <strong>{job.title.substring(0, 30)}...</strong>
        </span>
      </div>

      {/* Main Card */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
        
        {/* Banner Header */}
        <div style={{ borderBottom: '2px solid #0088cc', paddingBottom: '16px', marginBottom: '20px' }}>
          <span className="badge badge-blue" style={{ marginBottom: '8px', display: 'inline-block' }}>ADMIT CARD / HALL TICKET</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-heading)', lineHeight: '1.4', marginBottom: '12px' }}>
            {job.title}
          </h1>
          <div className="job-detail-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <span><Building2 className="w-4 h-4 inline mr-1" style={{ color: '#0088cc' }} /> <strong>Board:</strong> {job.organization || 'Exam Authority'}</span>
            <span><Tag className="w-4 h-4 inline mr-1" style={{ color: '#0088cc' }} /> <strong>Exam Name:</strong> {job.postName || job.title}</span>
            <span><UserCheck className="w-4 h-4 inline mr-1" style={{ color: '#0088cc' }} /> <strong>Status:</strong> Download Live / Out</span>
          </div>
        </div>

        {/* Quick Top CTA Box */}
        <div style={{ backgroundColor: 'rgba(0, 136, 204, 0.08)', border: '1px solid rgba(0, 136, 204, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0088cc' }}>Direct Admit Card / Exam City Link Active</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Download call letter using Registration Number & Date of Birth (DOB)</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={admitCardUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#0088cc', color: '#fff' }}>
              <FileText className="w-4 h-4 inline mr-1" /> Download Admit Card Now
            </a>
            <a href={notificationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <FileDown className="w-4 h-4 inline mr-1" /> Exam Notice PDF
            </a>
          </div>
        </div>

        {/* Dates Box */}
        <div className="detail-boxes-grid" style={{ marginBottom: '24px' }}>
          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: '#0088cc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarCheck className="w-5 h-5" /> Key Exam Dates
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Admit Card Released Date:</span> <strong>{job.appStart || 'Live Available'}</strong>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Written Examination Dates:</span> <strong style={{ color: '#0088cc' }}>{job.lastDate || job.appLast || 'Check Hall Ticket'}</strong>
              </li>
              <li style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Exam City Center Slip:</span> <strong>Available Online</strong>
              </li>
            </ul>
          </div>

          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: '#0088cc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle className="w-5 h-5" /> Important Instructions for Exam Day
            </h3>
            <ul style={{ paddingLeft: '18px', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-main)', margin: 0 }}>
              <li>Bring printed copy of Admit Card (preferably color printout).</li>
              <li>Carry valid Original Photo ID proof (Aadhaar Card, Voter ID, Driving License, or Passport).</li>
              <li>Reach the examination venue at least 60 minutes before reporting time.</li>
            </ul>
          </div>
        </div>

        {/* Overview */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info className="w-5 h-5" style={{ color: '#0088cc' }} /> Admit Card Release Summary
          </h3>
          <p style={{ fontSize: '0.96rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
            {job.description || 'Download the official written examination hall ticket, check exam roll number, exam center address, shift timings, and reporting instructions.'}
          </p>
        </div>

        {/* Direct Links Table */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0088cc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link className="w-5 h-5" /> Admit Card Direct Links
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
                          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#0088cc', color: '#fff' }}>
                            Click Here
                          </a>
                        ) : (
                          <span style={{ color: '#0088cc', fontWeight: 'bold' }}>Link Active Soon</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <>
                  <tr>
                    <td style={{ fontWeight: '700', width: '55%' }}>Download Admit Card / Hall Ticket</td>
                    <td>
                      <a href={admitCardUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#0088cc', color: '#fff' }}>
                        Click Here to Download
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '700' }}>Check Exam City / Application Status</td>
                    <td>
                      <a href={admitCardUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                        Check Status
                      </a>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Community Social Join */}
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-heading)' }}>
            Get Instant Exam City & Admit Card Direct Links
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
