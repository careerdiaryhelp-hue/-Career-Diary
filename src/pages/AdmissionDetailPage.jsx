import React from 'react';
import { ArrowLeft, Building2, Tag, CalendarCheck, GraduationCap, IndianRupee, UserCheck, Info, Link, FileDown, Send, MessageCircle, MapPin } from 'lucide-react';

export default function AdmissionDetailPage({ job, onBack }) {
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

  const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(job.title + ' official apply online portal')}`;

  const primaryApplyUrl = getLinkUrl('apply', 'counseling', 'counselling', 'form', 'registration', 'login') || fallbackSearchUrl;
  const notificationUrl = getLinkUrl('notification', 'prospectus', 'brochure', 'pdf', 'notice') || primaryApplyUrl;
  const officialWebUrl = getLinkUrl('official website', 'website', 'portal', 'home') || primaryApplyUrl;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Back Button & Breadcrumb */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to All Admissions
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Home &gt; Admission &gt; <strong>{job.title.substring(0, 30)}...</strong>
        </span>
      </div>

      {/* Main Container Card */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
        
        {/* Banner Header */}
        <div style={{ borderBottom: '2px solid #e67e22', paddingBottom: '16px', marginBottom: '20px' }}>
          <span className="badge badge-orange" style={{ marginBottom: '8px', display: 'inline-block' }}>COURSE & COLLEGE ADMISSION</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-heading)', lineHeight: '1.4', marginBottom: '12px' }}>
            {job.title}
          </h1>
          <div className="job-detail-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <span><Building2 className="w-4 h-4 inline mr-1" style={{ color: '#e67e22' }} /> <strong>Conducting Body:</strong> {job.organization || 'University / Board'}</span>
            <span><GraduationCap className="w-4 h-4 inline mr-1" style={{ color: '#e67e22' }} /> <strong>Course / Exam:</strong> {job.postName || job.title}</span>
            <span><UserCheck className="w-4 h-4 inline mr-1" style={{ color: '#e67e22' }} /> <strong>Total Seats:</strong> {job.vacancies || 'As per College Matrix'}</span>
            {job.state && <span><MapPin className="w-4 h-4 inline mr-1" style={{ color: '#e67e22' }} /> <strong>State:</strong> {job.state}</span>}
          </div>
        </div>

        {/* Quick Top CTA Box */}
        <div style={{ backgroundColor: 'rgba(230, 126, 34, 0.08)', border: '1px solid rgba(230, 126, 34, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#e67e22' }}>Online Admission & Counseling Registration Open</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Last Date to Register: <strong>{job.appLast || job.lastDate || 'As per admission schedule'}</strong></div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={primaryApplyUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#e67e22', color: '#fff' }}>
              <GraduationCap className="w-4 h-4 inline mr-1" /> Apply Online for Admission
            </a>
            <a href={notificationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <FileDown className="w-4 h-4 inline mr-1" /> Download Admission Prospectus
            </a>
          </div>
        </div>

        {/* 2 Column Details: Dates & Application Fees */}
        <div className="detail-boxes-grid" style={{ marginBottom: '24px' }}>
          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: '#e67e22', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarCheck className="w-5 h-5" /> Admission Schedule
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Online Form Start Date:</span> <strong>{job.appStart || 'Declared'}</strong>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Date to Register:</span> <strong style={{ color: '#e67e22' }}>{job.appLast || job.lastDate || 'As per rules'}</strong>
              </li>
              <li style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Entrance Test / Counseling Date:</span> <strong>Notified Soon</strong>
              </li>
            </ul>
          </div>

          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: '#e67e22', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IndianRupee className="w-5 h-5" /> Registration & Allotment Fee
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>General / OBC / EWS Fee:</span> <strong>{job.feeGen || '₹1,000'}</strong>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>SC / ST / Reserved Category:</span> <strong>{job.feeSc || '₹500'}</strong>
              </li>
              <li style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Mode:</span> <strong>Online (Debit/Credit Card, Net Banking, UPI)</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Age Limit & Qualification Box */}
        <div className="detail-info-box" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#e67e22', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck className="w-5 h-5" /> Course Eligibility & Age Criteria
          </h3>
          <div style={{ fontSize: '0.94rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
            <p style={{ marginBottom: '8px' }}><strong>Age Limit:</strong> {job.minAge || '17 Years'} to {job.maxAge || 'No Upper Age Limit'} (As per Course Regulations).</p>
            <p><strong>Educational Qualification required:</strong> {job.qualification || '10th / 12th Intermediate / Bachelor Degree from recognized board/university.'}</p>
          </div>
        </div>

        {/* Admission Description */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info className="w-5 h-5" style={{ color: '#e67e22' }} /> Course Details & Information
          </h3>
          <p style={{ fontSize: '0.96rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
            {job.description || 'Complete details on course duration, college seat distribution, counseling choice filling, entrance examination pattern, and fee structure.'}
          </p>
        </div>

        {/* Direct Links Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e67e22', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link className="w-5 h-5" /> Admission Portal Links
          </h3>
          <table className="table-styled">
            <tbody>
              {job.importantLinks && typeof job.importantLinks === 'object' && Object.keys(job.importantLinks).length > 0 ? (
                Object.entries(job.importantLinks).map(([label, url], idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', width: '55%' }}>{label}</td>
                    <td>
                      <a href={typeof url === 'string' && url.startsWith('http') ? url : fallbackSearchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#e67e22', color: '#fff' }}>
                        Click Here
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td style={{ fontWeight: '700', width: '55%' }}>Apply Online for Admission / Counseling</td>
                    <td>
                      <a href={primaryApplyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#e67e22', color: '#fff' }}>
                        Click Here to Apply Online
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '700' }}>Download Admission Prospectus PDF</td>
                    <td>
                      <a href={notificationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                        Download Prospectus
                      </a>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Join Social Media Community */}
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-heading)' }}>
            Get Admission & Counseling Updates on Telegram & WhatsApp
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
