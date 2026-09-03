import React from 'react';
import { ArrowLeft, Building2, Tag, CalendarCheck, IndianRupee, UserCheck, Info, Link, FileDown, Send, MessageCircle, CheckCircle2, MapPin, Share2 } from 'lucide-react';

export default function JobDetailPage({ job, onBack }) {
  if (!job) return null;

  const getLinkUrl = (key) => {
    if (job.importantLinks && typeof job.importantLinks === 'object') {
      const foundKey = Object.keys(job.importantLinks).find(k => k.toLowerCase().includes(key));
      if (foundKey) return job.importantLinks[foundKey];
    }
    return null;
  };

  const primaryApplyUrl = getLinkUrl('apply') || getLinkUrl('registration') || "https://careerdiary.in";
  const notificationUrl = getLinkUrl('notification') || getLinkUrl('official') || "https://careerdiary.in";
  const officialWebUrl = getLinkUrl('official website') || getLinkUrl('website') || "https://careerdiary.in";

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Back Button & Breadcrumb */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to All Jobs
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Home &gt; Latest Govt Jobs &gt; <strong>{job.title.substring(0, 30)}...</strong>
        </span>
      </div>

      {/* Main Container Card */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
        
        {/* Banner Header */}
        <div style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '16px', marginBottom: '20px' }}>
          <span className="badge badge-pink" style={{ marginBottom: '8px', display: 'inline-block' }}>LATEST GOVT JOB</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-heading)', lineHeight: '1.4', marginBottom: '12px' }}>
            {job.title}
          </h1>
          <div className="job-detail-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <span><Building2 className="w-4 h-4 inline mr-1" style={{ color: 'var(--primary-color)' }} /> <strong>Organization:</strong> {job.organization || 'Government Recruitment Board'}</span>
            <span><Tag className="w-4 h-4 inline mr-1" style={{ color: 'var(--primary-color)' }} /> <strong>Post Name:</strong> {job.postName || job.title}</span>
            <span><UserCheck className="w-4 h-4 inline mr-1" style={{ color: 'var(--primary-color)' }} /> <strong>Total Vacancies:</strong> {job.vacancies || job.totalPosts || 'Various'}</span>
            {job.state && <span><MapPin className="w-4 h-4 inline mr-1" style={{ color: 'var(--primary-color)' }} /> <strong>Job Location:</strong> {job.state} / All India</span>}
          </div>
        </div>

        {/* Quick Top CTA Box */}
        <div style={{ backgroundColor: 'rgba(230, 0, 92, 0.05)', border: '1px solid rgba(230, 0, 92, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-color)' }}>Direct Online Application Portal Active</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Last Date to Submit Online Application: <strong>{job.appLast || job.lastDate || 'As per schedule'}</strong></div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={primaryApplyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <Link className="w-4 h-4 inline mr-1" /> Apply Online Now
            </a>
            <a href={notificationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <FileDown className="w-4 h-4 inline mr-1" /> Download Notification PDF
            </a>
          </div>
        </div>

        {/* 2 Column Details: Dates & Application Fees */}
        <div className="detail-boxes-grid" style={{ marginBottom: '24px' }}>
          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarCheck className="w-5 h-5" /> Important Dates
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Application Start Date:</span> <strong>{job.appStart || job.importantDates?.applyStart || 'Declared'}</strong>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Date to Apply Online:</span> <strong style={{ color: 'var(--primary-color)' }}>{job.appLast || job.lastDate || job.importantDates?.applyLastDate || 'As per rules'}</strong>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Fee Payment Last Date:</span> <strong>{job.importantDates?.feeLastDate || job.appLast || job.lastDate || 'Same as last date'}</strong>
              </li>
              <li style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Exam / CBT Date:</span> <strong>{job.importantDates?.examDate || 'To Be Announced Soon'}</strong>
              </li>
            </ul>
          </div>

          <div className="detail-info-box">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IndianRupee className="w-5 h-5" /> Application Fee Details
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>General / OBC / EWS:</span> <strong>{job.feeGen || job.applicationFee?.['General / OBC / EWS'] || job.applicationFee?.['general_obc_ews'] || '₹100'}</strong>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>SC / ST / PwD / Female:</span> <strong>{job.feeSc || job.applicationFee?.['SC / ST'] || job.applicationFee?.['sc_st'] || '₹0 (Exempted)'}</strong>
              </li>
              <li style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Mode of Payment:</span> <strong>{job.applicationFee?.paymentMode || 'Online (Debit / Credit Card, Net Banking, UPI)'}</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Age Limit & Qualification Box */}
        <div className="detail-info-box" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck className="w-5 h-5" /> Age Limit & Educational Qualification
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Minimum Age:</span>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-heading)' }}>{job.minAge || job.ageLimit?.minimum || job.ageLimit?.min || '18 Years'}</div>
            </div>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Maximum Age:</span>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-heading)' }}>{job.maxAge || job.ageLimit?.maximum || job.ageLimit?.max || '37 Years'}</div>
            </div>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Age Relaxation:</span>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-heading)' }}>{job.ageLimit?.relaxation || 'As per Govt Rules (SC/ST 5Y, OBC 3Y)'}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.94rem', lineHeight: '1.6', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', color: 'var(--text-main)' }}>
            <strong>Educational Qualification:</strong> {job.qualification || job.eligibility?.education || job.eligibility?.qualification || 'Passed 10th / 12th / Diploma / Degree from a recognized board or university.'}
          </div>
        </div>

        {/* Recruitment Description */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info className="w-5 h-5" style={{ color: 'var(--primary-color)' }} /> Overview & Job Description
          </h3>
          <p style={{ fontSize: '0.96rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
            {job.description || job.uniqueDescription || 'Official notification details, post-wise vacancies, eligibility conditions, and application procedures for candidates.'}
          </p>
        </div>

        {/* Selection Process */}
        {job.selectionProcess && Array.isArray(job.selectionProcess) && job.selectionProcess.length > 0 && (
          <div className="detail-info-box" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 className="w-5 h-5" /> Selection Process Stages
            </h3>
            <ol style={{ paddingLeft: '20px', fontSize: '0.94rem', lineHeight: '1.7', margin: 0, color: 'var(--text-main)' }}>
              {job.selectionProcess.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}><strong>Stage {idx + 1}:</strong> {step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Vacancy Breakdown Table */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--primary-color)' }} /> Post Wise Vacancy Details
          </h3>
          <table className="table-styled">
            <thead>
              <tr>
                <th>Post Name / Cadre</th>
                <th>Total Posts</th>
                <th>Required Qualification</th>
              </tr>
            </thead>
            <tbody>
              {job.vacancyDetails && Array.isArray(job.vacancyDetails) && job.vacancyDetails.length > 0 ? (
                job.vacancyDetails.map((v, idx) => (
                  <tr key={idx}>
                    <td>{v["Post Name"] || v.postName || v.Post || v.name || job.postName || job.title}</td>
                    <td><strong>{v.Total || v.total || v.vacancies || job.vacancies || 'Various'}</strong></td>
                    <td>{v.Eligibility || v.eligibility || job.qualification || 'As per rules'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>{job.postName || job.title}</td>
                  <td><strong>{job.vacancies || job.totalPosts || 'Various Posts'}</strong></td>
                  <td>{job.qualification || 'As specified in eligibility box'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Direct Links Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link className="w-5 h-5" /> Official Direct Links
          </h3>
          <table className="table-styled">
            <tbody>
              <tr>
                <td style={{ fontWeight: '700', width: '55%' }}>Apply Online Link</td>
                <td>
                  <a href={primaryApplyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                    Click Here to Apply Online
                  </a>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700' }}>Download Official Notification PDF</td>
                <td>
                  <a href={notificationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                    Download Notification PDF
                  </a>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700' }}>Official Website</td>
                <td>
                  <a href={officialWebUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                    Visit Official Portal
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Join Social Media Community */}
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-heading)' }}>
            Get Daily Govt Job Alerts Direct on Your Phone
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Join 50,000+ candidates receiving instant updates for SSC, Railways, BPSC, Banking & State Jobs.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#0088cc', color: '#fff', padding: '10px 20px', fontSize: '0.95rem' }}>
              <Send className="w-4 h-4 inline mr-1" /> Join Telegram Channel
            </a>
            <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#25D366', color: '#fff', padding: '10px 20px', fontSize: '0.95rem' }}>
              <MessageCircle className="w-4 h-4 inline mr-1" /> Join WhatsApp Channel
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
