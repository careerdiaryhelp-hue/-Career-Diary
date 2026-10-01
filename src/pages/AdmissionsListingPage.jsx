import React from 'react';
import { GraduationCap, Calendar, IndianRupee, ArrowRight, Building2, BookOpen, ShieldCheck } from 'lucide-react';

export default function AdmissionsListingPage({ jobs, onSelectJob }) {
  const admissionsList = jobs.filter(j => (j.category || '').toUpperCase().includes('ADMISSION'));

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', color: '#e67e22', padding: '10px', borderRadius: '10px' }}>
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
              College & University Admission Notifications 2026
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              Apply Online for IIT GATE 2027, IIT JAM, Bihar STET, UP DElEd, IIM CAT, CLAT, CUET & State Entrance Exams.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Admissions Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {admissionsList.map((item) => (
          <a
            key={item.id}
            href={`/${item.id}`}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                onSelectJob(item.id);
              }
            }}
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '18px',
              boxShadow: 'var(--card-shadow)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              textDecoration: 'none',
              color: 'inherit'
            }}
            className="highlight-card"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-orange">ADMISSION 2026</span>
                {item.badge && <span className="badge badge-pink">{item.badge}</span>}
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', lineHeight: '1.4', marginBottom: '10px' }}>
                {item.title}
              </h3>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Building2 className="w-4 h-4 text-muted" /> <span>{item.organization || 'University Board'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <BookOpen className="w-4 h-4 text-muted" /> <span>{item.postName || item.vacancies || 'Courses Admissions'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Calendar className="w-4 h-4 text-muted" /> <span>Last Date: <strong>{item.appLast || item.lastDate || 'As per rules'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IndianRupee className="w-4 h-4 text-muted" /> <span>Fee: <strong>{item.feeGen || '₹1,000'}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                <ShieldCheck className="w-4 h-4 inline mr-1" /> Official Portal
              </span>
              <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#e67e22', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                View Full Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
