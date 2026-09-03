import React from 'react';
import { X, Building2, Tag, CalendarCheck, IndianRupee, UserCheck, Info, Link, FileDown, Send, MessageCircle, CheckCircle2, MapPin } from 'lucide-react';

export default function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  const categoryUpper = (job.category || '').toUpperCase();
  const isAdmitCard = categoryUpper.includes('ADMIT CARD');
  const isResult = categoryUpper.includes('RESULT') || categoryUpper.includes('ANSWER KEY');
  const isSyllabus = categoryUpper.includes('SYLLABUS');
  const isAdmission = categoryUpper.includes('ADMISSION');

  // Determine primary action text & links
  let primaryActionText = "Apply Online / Registration Portal";
  if (isAdmitCard) primaryActionText = "Download Admit Card / Exam City";
  else if (isResult) primaryActionText = "Check Result / Answer Key";
  else if (isSyllabus) primaryActionText = "Download Syllabus & Pattern PDF";
  else if (isAdmission) primaryActionText = "Apply Online for Admission";

  const getLinkUrl = (key) => {
    if (job.importantLinks && typeof job.importantLinks === 'object') {
      const foundKey = Object.keys(job.importantLinks).find(k => k.toLowerCase().includes(key));
      if (foundKey) return job.importantLinks[foundKey];
    }
    return null;
  };

  const primaryUrl = getLinkUrl('apply') || getLinkUrl('admit') || getLinkUrl('result') || getLinkUrl('download') || "https://careerdiary.in";
  const notificationUrl = getLinkUrl('notification') || getLinkUrl('official') || "https://careerdiary.in";

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-content-body">
          {/* Header */}
          <div className="job-detail-header">
            <div className="job-detail-title">{job.title}</div>
            <div className="job-detail-meta">
              <span><Building2 className="w-4 h-4 inline mr-1" /> {job.organization || 'Government Recruitment Board'}</span>
              <span><Tag className="w-4 h-4 inline mr-1" /> Category: {job.category}</span>
              <span><UserCheck className="w-4 h-4 inline mr-1" /> Vacancies/Seats: {job.vacancies || job.totalPosts || 'Various'}</span>
              {job.state && <span><MapPin className="w-4 h-4 inline mr-1" /> State: {job.state}</span>}
            </div>
          </div>

          {/* Quick Action Top Bar */}
          <div className="action-links-grid" style={{ marginBottom: '20px' }}>
            <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
              <Link className="w-4 h-4" /> {primaryActionText}
            </a>
            <a href={notificationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-block">
              <FileDown className="w-4 h-4" /> Official Notification PDF
            </a>
          </div>

          {/* Important Dates & Application Fee */}
          <div className="detail-boxes-grid">
            <div className="detail-info-box">
              <h4><CalendarCheck className="w-4 h-4 inline mr-1" /> Important Dates</h4>
              <ul>
                <li><span>Application / Event Start:</span> <strong>{job.appStart || job.importantDates?.applyStart || 'Declared'}</strong></li>
                <li><span>Last Date to Apply:</span> <strong style={{ color: 'var(--primary-color)' }}>{job.appLast || job.lastDate || job.importantDates?.applyLastDate || 'As per schedule'}</strong></li>
                <li><span>Exam / Event Date:</span> <strong>{job.importantDates?.examDate || 'Notified Soon'}</strong></li>
                {job.importantDates?.resultDate && <li><span>Result Date:</span> <strong>{job.importantDates.resultDate}</strong></li>}
              </ul>
            </div>

            <div className="detail-info-box">
              <h4><IndianRupee className="w-4 h-4 inline mr-1" /> Application Fee Structure</h4>
              <ul>
                <li><span>General / OBC / EWS:</span> <strong>{job.feeGen || job.applicationFee?.['General / OBC / EWS'] || job.applicationFee?.['general_obc_ews'] || '₹0'}</strong></li>
                <li><span>SC / ST / Reserved:</span> <strong>{job.feeSc || job.applicationFee?.['SC / ST'] || job.applicationFee?.['sc_st'] || '₹0'}</strong></li>
                <li><span>Payment Mode:</span> <strong>{job.applicationFee?.paymentMode || 'Online (Debit Card, Credit Card, Net Banking, UPI)'}</strong></li>
              </ul>
            </div>
          </div>

          {/* Age Limit & Qualification */}
          <div className="detail-info-box" style={{ marginBottom: '20px' }}>
            <h4><UserCheck className="w-4 h-4 inline mr-1" /> Age Limit & Eligibility Criteria</h4>
            <ul style={{ marginBottom: '12px' }}>
              <li><span>Minimum Age:</span> <strong>{job.minAge || job.ageLimit?.minimum || job.ageLimit?.min || '18 Years'}</strong></li>
              <li><span>Maximum Age:</span> <strong>{job.maxAge || job.ageLimit?.maximum || job.ageLimit?.max || '37 Years'}</strong></li>
              <li><span>Age Relaxation:</span> <strong>{job.ageLimit?.relaxation || 'As per Govt / Board Rules'}</strong></li>
            </ul>
            <p style={{ fontSize: '0.92rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', color: 'var(--text-main)' }}>
              <strong>Educational Qualification:</strong> {job.qualification || job.eligibility?.education || job.eligibility?.qualification || 'Passed 10th / 12th / Graduation degree from recognized university.'}
            </p>
          </div>

          {/* Detailed Overview */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--primary-color)' }}>
              <Info className="w-4 h-4 inline mr-1" /> Description & Summary
            </h4>
            <p style={{ fontSize: '0.94rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
              {job.description || job.uniqueDescription || 'Full details, vacancy distribution, eligibility conditions, and application steps for this notification.'}
            </p>
          </div>

          {/* Selection Process (if available) */}
          {job.selectionProcess && Array.isArray(job.selectionProcess) && job.selectionProcess.length > 0 && (
            <div className="detail-info-box" style={{ marginBottom: '20px' }}>
              <h4><CheckCircle2 className="w-4 h-4 inline mr-1" /> Selection Process</h4>
              <ol style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                {job.selectionProcess.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Vacancy / Seats Details Table */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '8px' }}>
              <Building2 className="w-4 h-4 inline mr-1" /> Vacancy / Post Details
            </h4>
            <table className="table-styled">
              <thead>
                <tr>
                  <th>Post Name / Discipline</th>
                  <th>Total Seats / Posts</th>
                  <th>Eligibility Criteria</th>
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
                    <td>{job.qualification || 'As specified above'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Direct Important Links Table */}
          {job.importantLinks && typeof job.importantLinks === 'object' && Object.keys(job.importantLinks).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--primary-color)' }}>
                <Link className="w-4 h-4 inline mr-1" /> Useful Important Direct Links
              </h4>
              <table className="table-styled">
                <tbody>
                  {Object.entries(job.importantLinks).map(([label, url], idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', width: '60%' }}>{label}</td>
                      <td>
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'underline' }}>
                          Click Here
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Social Alert Community Join Buttons */}
          <div className="action-links-grid" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block" style={{ backgroundColor: '#0088cc', color: '#fff', border: 'none' }}>
              <Send className="w-4 h-4" /> Join Telegram Updates
            </a>
            <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block" style={{ backgroundColor: '#25D366', color: '#fff', border: 'none' }}>
              <MessageCircle className="w-4 h-4" /> Join WhatsApp Channel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
