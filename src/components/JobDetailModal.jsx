import React from 'react';
import { X, Building2, Tag, CalendarCheck, IndianRupee, UserCheck, Info, Link, FileDown, Send } from 'lucide-react';

export default function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-content-body">
          <div className="job-detail-header">
            <div className="job-detail-title">{job.title}</div>
            <div className="job-detail-meta">
              <span><Building2 className="w-4 h-4 inline mr-1" /> {job.organization || 'Government Recruitment Board'}</span>
              <span><Tag className="w-4 h-4 inline mr-1" /> Category: {job.category}</span>
              <span><UserCheck className="w-4 h-4 inline mr-1" /> Vacancies: {job.vacancies || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-boxes-grid">
            <div className="detail-info-box">
              <h4><CalendarCheck className="w-4 h-4 inline mr-1" /> Important Dates</h4>
              <ul>
                <li><span>Application Start:</span> <strong>{job.appStart || 'Declared'}</strong></li>
                <li><span>Last Date to Apply:</span> <strong style={{ color: 'var(--primary-color)' }}>{job.appLast || job.lastDate || 'As per rules'}</strong></li>
                <li><span>Admit Card Date:</span> <strong>Notified Soon</strong></li>
                <li><span>Exam Date:</span> <strong>As per schedule</strong></li>
              </ul>
            </div>

            <div className="detail-info-box">
              <h4><IndianRupee className="w-4 h-4 inline mr-1" /> Application Fee</h4>
              <ul>
                <li><span>General / OBC / EWS:</span> <strong>{job.feeGen || '₹0'}</strong></li>
                <li><span>SC / ST / PH:</span> <strong>{job.feeSc || '₹0'}</strong></li>
                <li><span>Payment Mode:</span> <strong>Online (Debit/Credit Card, Net Banking, UPI)</strong></li>
              </ul>
            </div>
          </div>

          <div className="detail-info-box" style={{ marginBottom: '20px' }}>
            <h4><UserCheck className="w-4 h-4 inline mr-1" /> Age Limit & Eligibility Criteria</h4>
            <ul style={{ marginBottom: '12px' }}>
              <li><span>Minimum Age:</span> <strong>{job.minAge || '18 Years'}</strong></li>
              <li><span>Maximum Age:</span> <strong>{job.maxAge || '37 Years'}</strong></li>
              <li><span>Age Relaxation:</span> <strong>As per Govt Recruitment Rules</strong></li>
            </ul>
            <p style={{ fontSize: '0.9rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
              <strong>Educational Qualification:</strong> {job.qualification || 'Passed 10th / 12th / Graduation degree from recognized institute/board.'}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '8px' }}>
              <Info className="w-4 h-4 inline mr-1" /> Recruitment Overview
            </h4>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-main)' }}>{job.description}</p>
          </div>

          <table className="table-styled">
            <thead>
              <tr>
                <th>Post Name</th>
                <th>Total Vacancies</th>
                <th>Eligibility</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{job.postName || job.title}</td>
                <td><strong>{job.vacancies || 'Various'}</strong></td>
                <td>{job.qualification || 'Specified above'}</td>
              </tr>
            </tbody>
          </table>

          <div className="action-links-grid">
            <a href="https://careerdiary1.blogspot.com/" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
              <Link className="w-4 h-4" /> Apply Online / Official Portal
            </a>
            <button onClick={() => alert('Simulated Official Notification PDF Downloaded!')} className="btn btn-secondary btn-block">
              <FileDown className="w-4 h-4" /> Download Notification PDF
            </button>
            <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block">
              <Send className="w-4 h-4" /> Join Telegram Alert
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
